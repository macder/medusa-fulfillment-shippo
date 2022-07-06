import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor(
    {
      cartService,
      manager,
      orderService,
      pricingService,
      shippingOptionService,
      shippingProfileService,
      shippoClientService,
      shippoPackerService,
      totalsService,
    },
    options
  ) {
    super()

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {Manager} */
    this.manager_ = manager

    /** @private @const {OrderService} */
    this.orderService_ = orderService

    // /** @private @const {PricingService} */
    // this.pricingService_ = pricingService

    /** @private @const {ShippingOptionService} */
    this.shippingOptionService_ = shippingOptionService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {ShippoPackerService_} */
    this.shippoPackerService_ = shippoPackerService

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    /** @public @const {} */
    this.useClient = this.shippo_.getClient()

    this.binPackResults_ = []
  }

  async getFulfillmentOptions() {
    return await this.shippo_.retrieveFulfillmentOptions()
  }

  async validateOption(data) {
    return true
  }

  async validateFulfillmentData(optionData, data, cart) {
    console.log(
      "*******validateFulfillmentData: optionData",
      JSON.stringify(optionData, null, 2)
    )
    console.log(
      "*******validateFulfillmentData: data",
      JSON.stringify(data, null, 2)
    )
    console.log(
      "*******validateFulfillmentData: cart",
      JSON.stringify(cart, null, 2)
    )

    // if (optionData.type === "LIVE_RATE" && cart?.id) {
    //   throw new MedusaError(
    //     MedusaError.Types.NOT_ALLOWED,
    //     ""
    //     MedusaError.Codes.CART_INCOMPATIBLE_STATE
    //   )
    // }

    return {
      ...data,
    }
  }

  async createFulfillment(
    methodData,
    fulfillmentItems,
    fromOrder,
    fulfillment
  ) {
    const lineItems = await this.formatLineItems_(fulfillmentItems, fromOrder)
    lineItems.forEach((item) => {
      if (item.quantity < 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${item.title} quantity: ${item.quantity}`
        )
      }
    })

    const parcelName =
      fromOrder.metadata.shippo?.parcel_template_name ?? "Package Name N/A"

    return await this.shippo_
      .createOrder(
        await shippoOrder(fromOrder, fulfillment, lineItems, parcelName)
      )
      .then((response) => ({
        shippo_order_id: response.object_id,
        shipping_methods: fromOrder.shipping_methods.map((e) => e.id),
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  async cancelFulfillment(fulfillment) {
    return Promise.resolve({})
  }

  async canCalculate(data) {
    return data.type === "LIVE_RATE"
  }


  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {
    console.log('=============fulfillmentOption: ', JSON.stringify(fulfillmentOption, null, 2))
    console.log('=============fulfillmentData: ', JSON.stringify(fulfillmentData, null, 2))
    console.log('=============cart: ', JSON.stringify(cart, null, 2))

    throw "dev"

  }

  async createReturn(fromData) {
    return Promise.resolve({})
  }


  async retrievePackerResults(order_id) {
    const order = await this.orderService_.retrieve(order_id)

    if (order.metadata.shippo?.custom_shipping_options) {
      const cso_id = order.metadata.shippo.custom_shipping_options[0]
      return await this.customShippingOptionService_
        .retrieve(cso_id)
        .then((cso) => cso.metadata.shippo_binpack)
    }
    return { error: "This order has no packer data available" }
  }

  async findShippingOptionTypes_(type, cart) {
    return await this.shippingProfileService_
      .fetchCartOptions(cart)
      .then((cartShippingOptions) =>
        cartShippingOptions.filter(
          (shippingOption) => shippingOption.data.type === type
        )
      )
  }

  async formatLineItems_(items, order) {
    return await Promise.all(
      items.map(
        async (item) =>
          await this.totalsService_
            .getLineItemTotals(item, order)
            .then((totals) =>
              shippoLineItem(
                item,
                totals.unit_price,
                order.region.currency_code
              )
            )
      )
    )
  }

  async retrieveCart_(id) {
    return await this.cartService_.retrieve(id, {
      relations: [
        "shipping_address",
        "items",
        "items.tax_lines",
        "items.variant",
        "items.variant.product",
        "discounts",
        "region",
      ],
    })
  }
}

export default ShippoFulfillmentService
