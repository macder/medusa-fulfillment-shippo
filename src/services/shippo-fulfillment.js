import path from "path"
import { FulfillmentService } from "medusa-interfaces"
import { humanizeAmount, getConfigFile, MedusaError } from "medusa-core-utils"
import { getParcel } from "../utils/client"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"
import { validateShippingAddress } from "../utils/validator"
import Shippo from "../utils/shippo"
import { binPacker } from "../utils/bin-packer"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor({ cartService, shippingProfileService, totalsService }, options) {
    super()

    const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
    const { projectConfig } = configModule

    // for when released as an npm package
    // this.options_ = options
    this.options_ = projectConfig

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

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
                totals.unit_price,
                fromOrder.region.currency_code
              )
            )
      )
    )

    return await this.client_
      .createOrder(await shippoOrder(fromOrder, lineItems))
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

  async fetchLiveRates(cartID) {
    const cart = await this.cartService_.retrieve(cartID, {
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
    // console.log(cart)

    // Validate if cart has a complete shipping address
    const validAddress = validateShippingAddress(cart.shipping_address)
    if (validAddress.error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        validAddress.error.details[0].message
      )
    }

    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )
    // console.log(shippingOptions)

    const lineItems = await Promise.all(
      cart.items.map(async (item) => {
        const totals = await this.totalsService_.getLineItemTotals(item, cart)
        return shippoLineItem(item, totals.subtotal, cart.region.currency_code)
      })
    )
    // console.log(lineItems)

    const toAddress = shippoAddress(cart.shipping_address, cart.email)
    // console.log(toAddress)

    const parcels = await binPacker(cart.items)
    // console.log('*************parcels ', parcels)

    return await this.client_.fetchLiveRates(
      toAddress,
      lineItems,
      shippingOptions,
      parcels[0]
    )
  }
}

export default ShippoFulfillmentService
