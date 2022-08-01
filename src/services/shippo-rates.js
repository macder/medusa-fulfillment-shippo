import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem } from "../utils/formatters"

class ShippoRatesService extends BaseService {
  #cart = {}

  #cartService

  #logger

  #pricingService

  #shippingOptions = []

  #shippo

  #shippoPackageService

  #shippingProfileService

  #totalsService

  constructor({
    cartService,
    logger,
    pricingService,
    shippoClientService,
    shippoPackageService,
    shippingProfileService,
    totalsService,
  }) {
    super()

    /** @private @const {CartService} */
    this.#cartService = cartService

    /** @private @const {PricingService} */
    this.#pricingService = pricingService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoPackageService} */
    this.#shippoPackageService = shippoPackageService

    /** @private @const {ShippingProfileService} */
    this.#shippingProfileService = shippingProfileService

    /** @private @const {TotalsService} */
    this.#totalsService = totalsService

    this.#logger = logger
  }

  /**
   * Fetch live-rates for cart shipping options
   * @param {string} cartId - cart id to fetch rates for
   * @return {array.<object>} - list of shippo live-rates
   */
  async fetchCartRates(cartId) {
    await this.#setProps(cartId)
    const rates = await this.#fetchRates()
    return rates
  }

  /**
   * Fetch live-rate for specific option for cart
   * @param {string} cartId - cart id to fetch rate for
   * @param {string|FulfillmentOption} option - ShippingOption id or FulfillmentOption
   * @return {object} shippo live-rate object
   */
  async fetchOptionRate(cartId, option) {
    this.#setCart(await this.#fetchCart(cartId))

    if (await this.#isCartReady()) {
      const shippingOption = await this.#fetchOptions().then((options) =>
        option?.name
          ? [options.find((so) => so.data.object_id === option.object_id)]
          : [options.find((so) => so.id === option)]
      )

      this.#setOptions(shippingOption)
      const rate = await this.#fetchRates()
      return rate[0]
    }
    return Promise.reject({ error: "cart not ready" })
  }

  /**
   * Get the price from rate object
   * @param {object} rate - shippo live-rate object
   * @return {int} the calculated or fallback price
   */
  getPrice(rate) {
    const price = rate?.amount_local || rate?.amount
    return parseInt(parseFloat(price) * 100, 10)
  }

  async #applyRates() {
    const rates = await this.#fetchRates()

    this.#setOptions(
      this.#shippingOptions.map((so) =>
        this.#putRate(so, this.constructor.#findRate(so, rates))
      )
    )
  }

  async #buildRequestParams(parcelTemplate = null) {
    const parcelId =
      parcelTemplate ?? (await this.#packBins().then((result) => result[0].id))

    const toAddress = await shippoAddress(
      this.#cart.shipping_address,
      this.#cart.email
    )

    return {
      address_to: toAddress,
      line_items: await this.#formatLineItems(),
      parcel: parcelId,
    }
  }

  async #fetchCart(cartId) {
    return this.#cartService.retrieve(cartId, {
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

  async #fetchOptions() {
    return this.#shippingProfileService.fetchCartOptions(this.#cart)
  }

  async #fetchRates() {
    // TODO - why is it making 2 calls?
    const params = await this.#buildRequestParams()
    const { parcel } = params
    const fulfillmentOptions = this.#shippingOptions.map((so) => ({
      ...so.data,
      so_id: so.id,
    }))

    const rates = await this.#shippo.useClient.liverates
      .create(params)
      .then((liverates) =>
        liverates.results
          .filter((rate) =>
            fulfillmentOptions.find((fo) => fo.name === rate.title && true)
          )
          .map((rate) => ({
            ...rate,
            parcel,
            shipping_option: fulfillmentOptions.find(
              (fo) => fo.name === rate.title
            ).so_id,
          }))
      )
      .catch((e) => this.#logger.error(e))
    return rates
  }

  static #findRate(shippingOption, rates) {
    return rates.find((rate) => rate.title === shippingOption.data.name)
  }

  async #formatLineItems() {
    return Promise.all(
      this.#cart.items.map(async (item) =>
        this.#totalsService
          .getLineItemTotals(item, this.#cart)
          .then((totals) =>
            shippoLineItem(
              item,
              totals.unit_price,
              this.#cart.region.currency_code
            )
          )
      )
    )
  }

  async #isCartReady() {
    if (!this.#cart.email || this.#cart.items.length === 0) {
      return false
    }
    return this.#validateAddress()
  }

  async #packBins() {
    const packed = await this.#shippoPackageService.packCart(this.#cart)
    return packed
  }

  /**
   *
   * @param {ShippingOption} option
   * @param {object} rate
   */
  #putRate(option, rate) {
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

  async #requiresRates() {
    return (
      !!this.#shippingOptions.find((so) => so.data?.type === "LIVE_RATE") &&
      true
    )
  }

  #setCart(cart) {
    this.#cart = cart
  }

  #setOptions(options) {
    this.#shippingOptions = options
  }

  async #setOptionPrices() {
    const options = await this.#pricingService.setShippingOptionPrices(
      this.#shippingOptions,
      {
        cart_id: this.#cart.id,
      }
    )

    this.#setOptions(options)
  }

  async #setProps(cartId) {
    this.#setCart(await this.#fetchCart(cartId))
    this.#setOptions(await this.#fetchOptions())
  }

  async #validateAddress() {
    const address = this.#cart.shipping_address
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

  async decorateOptions(cartId, options) {
    this.#setCart(await this.#fetchCart(cartId))
    this.#setOptions(options)

    const cartIsReady = await this.#isCartReady()
    const requiresRates = await this.#requiresRates()

    if (cartIsReady && requiresRates) {
      await this.#applyRates()
    }
    await this.#setOptionPrices()
    return this.#shippingOptions
  }
}

export default ShippoRatesService
