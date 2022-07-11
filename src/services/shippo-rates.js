import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem } from "../utils/formatters"

class ShippoRatesService extends BaseService {
  cart_ = {}
  shippingOptions_ = []

  constructor(
    {
      cartService,
      pricingService,
      shippoClientService,
      shippoPackerService,
      shippingProfileService,
      totalsService,
    },
    options
  ) {
    super()

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {PricingService} */
    this.pricingService_ = pricingService

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {ShippoPackerService_} */
    this.shippoPackerService_ = shippoPackerService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService
  }

  setCart_(cart) {
    this.cart_ = cart
  }

  setOptions_(options) {
    this.shippingOptions_ = options
  }

  /**
   * Calls ShippingProfileService.fetchCartOptions and decorates ShippingOption.amount
   * Only decorates live-rate options when cart has shipping address and items
   * @param {string} cart_id - cart id to retrieve shipping options
   * @return {array.<ShippingOption>} contextually priced list of available shipping options
   */
  async fetchCartOptions(cart_id) {
    this.setCart_(await this.fetchCart_(cart_id))
    this.setOptions_(await this.fetchOptions_())

    const cartIsReady = await this.isCartReady_()
    const requiresRates = await this.requiresRates_()

    if (cartIsReady && requiresRates) {
      await this.applyRates_()
    }
    await this.setOptionPrices_()
    return this.shippingOptions_
  }

  async fetchOptions_() {
    return await this.shippingProfileService_.fetchCartOptions(this.cart_)
  }

  async fetchCart_(cart_id) {
    return await this.cartService_.retrieve(cart_id, {
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

  /** retrieveShippingOptions
   * @param {Cart} cart -
   * @return {ShippingOption[]}
   */
  // async retrieveShippingOptions(cart) {
  //   const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
  //     cart
  //   )

  //   this.setCart_(cart)
  //   this.setOptions_(shippingOptions)

  //   // this.cartShippingOptions_ = shippingOptions

  //   const cartIsReady = await this.isCartReady_()
  //   const requiresRates = await this.requiresRates_()

  //   if (cartIsReady && requiresRates) {
  //     return await this.applyRates_()
  //   }
  //   return shippingOptions
  // }

  async retrieveRawRate(fulfillmentOption, cart, parcelId) {
    const args = await this.getRequestParams_(
      [fulfillmentOption],
      cart,
      parcelId
    )
    return await this.fetchRates_(args).then((rate) => rate[0])
  }

  /** retrieveRawRateList
   * @param {Cart} - cart
   * @return {object[]} -
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
  async applyRates_() {
    const fulfillmentOptions = this.shippingOptions_.map((so) => so.data)
    const args = await this.getRequestParams_(fulfillmentOptions, this.cart_)

    const rates = await this.fetchRates_(args)

    // TODO: use fallback price or remove if api request fails
    // Perhaps polling is appropriate, i.e 3 max attempt at 1sec intervals

    this.setOptions_(
      this.shippingOptions_.map((so) =>
        this.setRate_(so, this.findRate_(so, rates))
      )
    )
  }

  async setOptionPrices_() {
    const options = await this.pricingService_.setShippingOptionPrices(
      this.shippingOptions_,
      {
        cart_id: this.cart_.id,
      }
    )

    this.setOptions_(options)
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
      .fetchUserParcelTemplates()
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
  async isCartReady_() {
    if (!this.cart_.email || this.cart_.items.length === 0) {
      return false
    }
    return await this.validateAddress_()
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
  async requiresRates_() {
    // console.log('*********this.cartShippingOptions_: ', JSON.stringify(this.cartShippingOptions_, null, 2))

    return (
      !!this.shippingOptions_.find((so) => so.data?.type === "LIVE_RATE") &&
      true
    )
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

  async validateAddress_() {
    const address = this.cart_.shipping_address
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
