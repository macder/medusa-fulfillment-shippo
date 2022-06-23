import path from "path"
import { FulfillmentService } from "medusa-interfaces"
import { humanizeAmount, getConfigFile, MedusaError } from "medusa-core-utils"
// import shippo from "shippo"
import { getParcel } from "../utils/client"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"

import Shippo from "../utils/shippo"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor({ totalsService }, options) {
    super()

    const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
    const { projectConfig } = configModule

    // for when released as an npm package
    // this.options_ = options
    this.options_ = projectConfig

    /** @private @const {Shippo} */
    // this.shippo_ = shippo(this.options_.api_key)

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    this.client_ = new Shippo(this.options_.api_key)
  }

  async getFulfillmentOptions() {
    return await this.client_.retrieveFulfillmentOptions
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

    const shippoOrder = await this.formatOrder(fromOrder, lineItems)

    return await this.client_
      .createOrder(shippoOrder)
      .then((response) => ({
        shippo_order_id: response.object_id,
        // shippo_parcel: shippoParcel.object_id,
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  canCalculate(data) {
    return data.type === "LIVE_RATE"
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {}

  formatAddress(address, email) {
    return shippoAddress(address, email)
  }

  async formatOrder(order, lineItems) {
    return await shippoOrder(order, lineItems)
  }
}

export default ShippoFulfillmentService

// console.log('***********', JSON.stringify(shippingOptions, null, 2))
