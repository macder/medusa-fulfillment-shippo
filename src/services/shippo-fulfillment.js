import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoLineItem, shippoOrder } from "../utils/formatters"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor(
    {
      cartService,
      orderService,
      shippoClientService,
      shippoRatesService,
      totalsService,
    },
    options
  ) {
    super()

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {OrderService} */
    this.orderService_ = orderService

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {ShippoRatesService} */
    this.shippoRatesService_ = shippoRatesService

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    /** @public @const {} */
    this.useClient = this.shippo_.getClient()
  }

  async getFulfillmentOptions() {
    return await this.shippo_.retrieveFulfillmentOptions()
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

    const parcelName = methodData.parcel_template.name ?? "Package Name N/A" // >= 0.12.0
    // fromOrder.metadata.shippo?.parcel_template_name ?? "Package Name N/A" // =< 0.11.0

    return await this.shippo_
      .createOrder(
        await shippoOrder(fromOrder, fulfillment, lineItems, parcelName)
      )
      .then((response) => ({
        shippo_order_id: response.object_id,
        // shipping_methods: fromOrder.shipping_methods.map((e) => e.id), // =< 0.11.0
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
    // thanks, but the cart is missing the shipping_address relation...
    cart = await this.retrieveCart_(cart.id)
    const price = await this.shippoRatesService_.retrievePrice(
      fulfillmentOption,
      cart,
      fulfillmentData.parcel_template.id
    )
    return price
  }

  async createReturn(fromData) {
    return Promise.resolve({})
  }

  async validateOption(data) {
    return true
  }

  async validateFulfillmentData(optionData, data, cart) {
    const parcel = await this.shippoRatesService_
      .packBins(cart.items)
      .then((result) => ({
        parcel_template: {
          id: result[0].object_id,
          name: result[0].name,
        },
      }))

    // TODO: decide and figure out where to store packer results
    // It used to live in the cso meta data...
    // /admin/orders/:id/shippo/packer depends on this data :/

    return {
      ...data,
      ...parcel,
    }
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
