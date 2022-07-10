import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoLineItem, shippoOrder } from "../utils/formatters"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor(
    {
      cartService,
      eventBusService,
      orderService,
      shippoClientService,
      shippoPackerService,
      shippoRatesService,
      totalsService,
    },
    options
  ) {
    super()

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {EventBusService} */
    this.eventBusService_ = eventBusService

    /** @private @const {OrderService} */
    this.orderService_ = orderService

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {ShippoPackerService} */
    this.shippoPackerService_ = shippoPackerService

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
    const fromAddress = await this.shippo_.fetchSenderAddress()

    const lineItems = await this.formatLineItems_(fulfillmentItems, fromOrder)
    lineItems.forEach((item) => {
      if (item.quantity < 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${item.title} quantity: ${item.quantity}`
        )
      }
    })

    const parcelName = methodData.parcel_template.name ?? null

    const shippoOrder = await this.createShippoOrder_(fromOrder, fromAddress, lineItems, parcelName)
    .then(response => {
      this.eventBusService_.emit("shippo.order_created", {
        order_id: fromOrder.id,
        fulfillment_id: fulfillment.id,
        customer_id: fromOrder.customer_id,
        shippo_order: response 
      })
      return response
    })

    return {
      shippo_order_id: shippoOrder.object_id
    }
  }

  async createShippoOrder_(order, fromAddress, lineItems, parcelName) {
    return await this.shippo_
      .createOrder(
        await shippoOrder(order, fromAddress, lineItems, parcelName)
      )
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
    return await this.shippoRatesService_.getPrice(
      fulfillmentData.rate_at_checkout
    )
  }

  // WIP
  async createReturn(returnOrder) {
    return Promise.resolve({})
  }

  async validateOption(data) {
    return true
  }

  async validateFulfillmentData(optionData, data, cart) {
    if (optionData.is_return) {
      return { ...data }
    }

    const parcel = await this.shippo_
      .fetchCustomParcelTemplates()
      .then(
        async (parcels) =>
          await this.shippoPackerService_
            .packBins(cart.items, parcels)
            .then((pack) => ({ id: pack[0].object_id, name: pack[0].name }))
      )

    let rate = null

    if (optionData.type === "LIVE_RATE") {
      // we need the cart with shipping_address relation
      cart = await this.retrieveCart_(cart.id)
      rate = await this.shippoRatesService_.retrieveRawRate(
        optionData,
        cart,
        parcel.id
      )
    }

    return {
      ...data,
      rate_at_checkout: rate ?? null,
      parcel_template: parcel,
    }
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
      select: ["subtotal"],
      relations: [
        "shipping_address",
        "items",
        "items.tax_lines",
        "items.variant",
        "items.variant.product",
        "discounts",
        "discounts.rule",
        "region",
      ],
    })
  }
}

export default ShippoFulfillmentService
