import { FulfillmentService } from "medusa-interfaces"
import { humanizeAmount, MedusaError } from "medusa-core-utils"
import shippo from "shippo"
import {
  getShippingOptions,
  getShippingOptionGroups,
  getParcel,
} from "../utils/client"
import { shippoAddress, shippoLineItem } from "../utils/shippo"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor({ totalsService }, options) {
    super()

    this.options_ = options

    /** @private @const {Shippo} */
    this.shippo_ = shippo(this.options_.api_key)

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService
  }

  async getFulfillmentOptions() {
    const shippingOptions = await getShippingOptions()
    const shippingOptionGroups = await getShippingOptionGroups()
    return [...shippingOptions, ...shippingOptionGroups]
  }

  async validateOption(data) {
    return true
  }

  async validateFulfillmentData(optionData, data, cart) {
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
    const toAddress = shippoAddress(fromOrder.shipping_address, fromOrder.email)
    const currencyCode = fromOrder.currency_code.toUpperCase()
    const shippoParcel = await getParcel(fromOrder.metadata.shippo_parcel)
    const shippingOptionName =
      fromOrder.shipping_methods[0].shipping_option.name

    const lineItems = await Promise.all(
      fulfillmentItems.map(
        async (item) =>
          await this.totalsService_
            .getLineItemTotals(item, fromOrder)
            .then((totals) =>
              shippoLineItem(
                item,
                totals.subtotal,
                fromOrder.region.currency_code
              )
            )
      )
    )
    const totalWeight = lineItems
      .map((e) => e.weight * e.quantity)
      .reduce((sum, current) => sum + current, 0)

    return await this.shippo_.order
      .create({
        order_number: fromOrder.display_id,
        order_status: "PAID",
        to_address: toAddress,
        line_items: lineItems,
        placed_at: fromOrder.created_at,
        shipping_cost: humanizeAmount(fromOrder.shipping_total, currencyCode),
        shipping_cost_currency: currencyCode,
        shipping_method: `${shippingOptionName} - (${shippoParcel.name}) - ${currencyCode}`,
        total_tax: humanizeAmount(fromOrder.tax_total, currencyCode),
        total_price: humanizeAmount(fromOrder.total, currencyCode),
        subtotal_price: humanizeAmount(fromOrder.subtotal, currencyCode),
        currency: currencyCode,
        weight: totalWeight,
        weight_unit: this.options_.weight_unit_type,
      })
      .then((response) => ({
        shippo_order_id: response.object_id,
        shippo_parcel: shippoParcel.object_id,
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  canCalculate(data) {
    return data.type === "LIVE_RATE"
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {}
}

export default ShippoFulfillmentService
