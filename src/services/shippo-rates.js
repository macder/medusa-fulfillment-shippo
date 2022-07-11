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

  /**
   * Calls ShippingProfileService.fetchCartOptions and decorates ShippingOption.amount
   * Only decorates live-rate options when cart has shipping address and items
   * @param {string} cartId - cart id to fetch shipping options for
   * @return {array.<ShippingOption>} contextually priced list of available shipping options
   */
  async fetchCartOptions(cartId) {
    await this.setProps_(cartId)

    const cartIsReady = await this.isCartReady_()
    const requiresRates = await this.requiresRates_()

    if (cartIsReady && requiresRates) {
      await this.applyRates_()
    }
    await this.setOptionPrices_()
    return this.shippingOptions_
  }

  /** 
   * Finds live-rates for cart shipping options
   * @param {string} cartId - cart id to fetch rates for
   * @return {array.<object>} - list of shippo live-rates
   */
  async fetchCartRates(cartId) {
    await this.setProps_(cartId)
    const args = await this.buildRequestParams_()
    return await this.fetchRates_(args)
  }

  /**
   * Get the price from rate object
   * @param {object} rate - shippo live-rate object
   * @return {int} the calculated or fallback price
   */
  getPrice(rate) {
    // amount_local: calculated || amount: fallback
    const price = rate?.amount_local || rate?.amount
    return parseInt(parseFloat(price) * 100, 10)
  } 

  async applyRates_() {
    const args = await this.buildRequestParams_()
    const rates = await this.fetchRates_(args)

    this.setOptions_(
      this.shippingOptions_.map((so) =>
        this.putRate_(so, this.findRate_(so, rates))
      )
    )
  }

  async buildRequestParams_(parcelTemplate = null) {
    const parcelId =
      parcelTemplate ??
      (await this.packBins_().then((result) => result[0].object_id))

    return {
      options: await this.getFulfillmentOptions_(),
      to_address: await this.formatShippingAddress_(),
      line_items: await this.formatLineItems_(),
      parcel_template_id: parcelId,
    }
  }

  async fetchCart_(cartId) {
    return await this.cartService_.retrieve(cartId, {
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

  async fetchOptions_() {
    return await this.shippingProfileService_.fetchCartOptions(this.cart_)
  }
  
  async fetchRates_(args) {
    return await this.shippo_
      .fetchLiveRates(args)
      .catch((e) => console.error(e))
  }

  findRate_(shippingOption, rates) {
    return rates.find((rate) => rate.title === shippingOption.data.name)
  }

  async formatLineItems_() {
    return await Promise.all(
      this.cart_.items.map(
        async (item) =>
          await this.totalsService_
            .getLineItemTotals(item, this.cart_)
            .then((totals) =>
              shippoLineItem(item, totals.unit_price, this.cart_.region.currency_code)
            )
      )
    )
  }

  async formatShippingAddress_() {
    return await shippoAddress(this.cart_.shipping_address, this.cart_.email)
  }

  async getFulfillmentOptions_() {
    return this.shippingOptions_.map((so) => so.data)
  }

  async isCartReady_() {
    if (!this.cart_.email || this.cart_.items.length === 0) {
      return false
    }
    return await this.validateAddress_()
  }

  async packBins_() {
    const packed = await this.shippo_
      .fetchUserParcelTemplates()
      .then(
        async (parcels) =>
          await this.shippoPackerService_.packBins(this.cart_.items, parcels)
      )
    this.packerResult_ = packed
    return packed
  }

  /**
   * 
   * @param {ShippingOption} option
   * @param {object} rate
   */
  putRate_(option, rate) {
    const price = rate ? this.getPrice(rate) : option.amount

    if (option.data.type === "LIVE_RATE" && option.price_type === "flat_rate") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Shippo: '${option.name}' - price_type mismatch | ` +
        "Expected price_type: calculated | " +
        "Received price_type: flat_rate. See README.md"
      )
    }
    return { ...option, amount: price }
  }

  async requiresRates_() {
    return (
      !!this.shippingOptions_.find((so) => so.data?.type === "LIVE_RATE") &&
      true
    )
  }

  // DEPRECATED
  async retrieveRawRate(fulfillmentOption, cart, parcelId) {

    const args = await this.buildRequestParams_(
      [fulfillmentOption],
      cart,
      parcelId
    )
    return await this.fetchRates_(args).then((rate) => rate[0])

  }

  setCart_(cart) {
    this.cart_ = cart
  }

  setOptions_(options) {
    this.shippingOptions_ = options
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

  async setProps_(cartId) {
    this.setCart_(await this.fetchCart_(cartId))
    this.setOptions_(await this.fetchOptions_())
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
