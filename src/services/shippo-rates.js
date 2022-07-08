import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem } from "../utils/formatters"

class ShippoRatesService extends BaseService {
  constructor(
    {
      shippoClientService,
      shippoPackerService,
      shippingProfileService,
      totalsService,
    },
    options
  ) {
    super()

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {ShippoPackerService_} */
    this.shippoPackerService_ = shippoPackerService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService
  }

  /** retrieveShippingOptions
   * @param {Cart} -
   * @return {array} -
   */
  async retrieveShippingOptions(cart) {
    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )
    const cartIsReady = await this.isCartReady_(cart)
    const requiresRates = await this.requiresRates_(shippingOptions)

    if (cartIsReady && requiresRates) {
      return await this.applyRates_(shippingOptions, cart)
    }
    return shippingOptions
  }

  /** retrieveRawRate
   * @param {object}
   * @param {Cart} - LineItem object
   * @param {string}
   * @return {object} -
   */
  async retrieveRawRate(fulfillmentOption, cart, parcelId) {
    const args = await this.getRequestParams_(
      [fulfillmentOption],
      cart,
      parcelId
    )
    return await this.fetchRates_(args).then((rate) => rate[0])
  }

  /** retrieveRawRateList
   * @param {Cart} -
   * @return {array} -
   */
  async retrieveRawRateList(cart) {
    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )
    const fulfillmentOptions = shippingOptions.map((so) => so.data)
    const args = await this.getRequestParams_(fulfillmentOptions, cart)

    return await this.fetchRates_(args)
  }

  /** applyRates_
   * @param {array} -
   * @param {Cart}-
   * @return {array} -
   */
  async applyRates_(shippingOptions, cart) {
    const fulfillmentOptions = shippingOptions.map((so) => so.data)
    const args = await this.getRequestParams_(fulfillmentOptions, cart)

    const rates = await this.fetchRates_(args)

    // TODO: use fallback price or remove if api request fails
    // Perhaps polling is appropriate, i.e 3 max attempt at 1sec intervals

    return shippingOptions.map((so) =>
      this.setRate_(so, this.findRate_(so, rates))
    )
  }

  /** fetchRates_
   * @param {object} -
   * @return {array} -
   */
  async fetchRates_(args) {
    return await this.shippo_
      .fetchLiveRates(args)
      .catch((e) => console.error(e))
  }

  /** fetchRates_
   * @param {object} -
   * @return {array} -
   */
  async getRequestParams_(fulfillmentOptions, cart, parcelTemplate = null) {
    const parcelId =
      parcelTemplate ??
      (await this.packBins(cart.items).then((result) => result[0].object_id))

    return {
      options: fulfillmentOptions,
      to_address: await this.formatShippingAddress_(cart),
      line_items: await this.formatLineItems_(cart),
      parcel_template_id: parcelId,
    }
  }

  /**
   * @param  {array} items
   */
  async packBins(items) {
    const packed = await this.shippo_
      .fetchCustomParcelTemplates()
      .then(
        async (parcels) =>
          await this.shippoPackerService_.packBins(items, parcels)
      )
    this.packerResult_ = packed
    return packed
  }

  /**
   * @param  {array} shippingOption
   * @param  {array} rates
   */
  findRate_(shippingOption, rates) {
    return rates.find((rate) => rate.title === shippingOption.data.name)
  }

  // TODO: duplicated code - find a place for this
  /**
   * @param  {object} cart
   */
  async formatLineItems_(cart) {
    return await Promise.all(
      cart.items.map(
        async (item) =>
          await this.totalsService_
            .getLineItemTotals(item, cart)
            .then((totals) =>
              shippoLineItem(item, totals.unit_price, cart.region.currency_code)
            )
      )
    )
  }

  /**
   */
  getPackerResult() {
    return this.packerResult_
  }

  /**
   * @param  {object} cart
   */
  async isCartReady_(cart) {
    if (!cart.email || cart.items.length === 0) {
      return false
    }
    return await this.validateAddress_(cart.shipping_address)
  }

  /**
   * @param  {object} cart
   */
  async formatShippingAddress_(cart) {
    return await shippoAddress(cart.shipping_address, cart.email)
  }

  /**
   * @param  {object} rate
   */
  getPrice(rate) {
    // amount_local: calculated || amount: fallback
    const price = rate?.amount_local || rate?.amount
    return parseInt(parseFloat(price) * 100, 10)
  }

  /**
   * @param  {array} shippingOptions
   */
  async requiresRates_(shippingOptions) {
    return !!shippingOptions.find((so) => so.data?.type === "LIVE_RATE") && true
  }

  /**
   * @param  {object} shippingOption
   * @param  {object} rate
   */
  setRate_(shippingOption, rate) {
    const so = shippingOption
    const price = rate ? this.getPrice(rate) : so.amount

    if (so.data.type === "LIVE_RATE" && so.price_type === "flat_rate") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Shippo: '${so.name}' - price_type mismatch | ` +
          "Expected price_type: calculated | " +
          "Received price_type: flat_rate. See README.md"
      )
    }
    return { ...so, amount: price }
  }
  /**
   * @param  {object} address
   */
  async validateAddress_(address) {
    const requiredFields = [
      "first_name",
      "last_name",
      "address_1",
      "city",
      "country_code",
      "postal_code",
    ]

    const emptyFields = requiredFields.filter((field) => !address[field])

    return emptyFields.length < 1
  }
}

export default ShippoRatesService
