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
      shippoPackerService,
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
    const shippingOptions = await this.shippo_.retrieveFulfillmentOptions()
    const returnOptions = this.makeReturnOptions_(shippingOptions)
    return shippingOptions.concat(returnOptions)
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

    const parcelName = methodData.parcel_template.name ?? null

    return await this.shippo_
      .createOrder(
        await shippoOrder(fromOrder, fulfillment, lineItems, parcelName)
      )
      .then((response) => ({
        shippo_order_id: response.object_id,
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  async cancelFulfillment(fulfillment) {
    return Promise.resolve({})
  }

  async canCalculate(data) {
    return (data.type === "LIVE_RATE" || data.supports_return_labels) ?? false
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {
    return await this.shippoRatesService_.getPrice(
      fulfillmentData.rate_at_checkout
    )
  }

  async createReturn(returnOrder) {
    const order = await this.orderService_.retrieve(returnOrder.order_id, {
      relations: ["fulfillments"],
    })

    const transaction = await this.shippo_
      .fetchOrderTransactions({ displayId: order.display_id })
      .then((transactions) => {
        const returnTransact = transactions.find((ta) => ta.is_return)

        if (!returnTransact) {
          throw "shippo return label for order not found"
        } else if (returnTransact.object_state !== "VALID") {
          throw `shippo return label transaction state is ${returnTransact.object_state}`
        } else if (returnTransact.object_status !== "SUCCESS") {
          throw `shippo return label transaction status is ${returnTransact.object_status}`
        } else if (
          !order.fulfillments.find(
            (fm) => fm.data.shippo_order_id === returnTransact.order.object_id
          )
        ) {
          throw "fulfillment for shippo order not found"
        }
        return returnTransact
      })
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, e)
      })

    const label = await this.shippo_
      .fetchTransaction(transaction.object_id)
      .then((response) => response.label_url)

    const { rate, tracking_url_provider, tracking_number } = transaction

    return {
      rate,
      label,
      tracking_url_provider,
      tracking_number,
    }
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

  makeReturnOptions_(fulfillmentOptions) {
    return fulfillmentOptions
      .filter((option) => option.supports_return_labels)
      .map((option) => {
        return {
          ...option,
          is_return: true,
        }
      })
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
