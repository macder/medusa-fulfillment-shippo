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
   * @deprecated since 0.17.0 use shippingProfileService.fetchCartOptions instead
   * @param {string} cartId - cart id to fetch shipping options for
   * @return {array.<ShippingOption>} contextually priced list of available shipping options
   */
  async fetchCartOptions(cartId) {
    await this.#setProps(cartId)
    return this.shippingOptions_
  }

  /**
   * Fetch live-rates for cart shipping options
   * @param {string} cartId - cart id to fetch rates for
   * @return {array.<object>} - list of shippo live-rates
   */
  async fetchCartRates(cartId) {
    await this.#setProps(cartId)
    return await this.#fetchRates()
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
      this.shippingOptions_.map((so) =>
        this.#putRate(so, this.#findRate(so, rates))
      )
    )
  }

  async #buildRequestParams(parcelTemplate = null) {
    const parcelId =
      parcelTemplate ??
      (await this.#packBins().then((result) => result[0].object_id))

    const toAddress = await shippoAddress(
      this.cart_.shipping_address,
      this.cart_.email
    )

    return {
      address_to: toAddress,
      line_items: await this.#formatLineItems(),
      parcel: parcelId,
    }
  }

  async #fetchCart(cartId) {
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

  async #fetchOptions() {
    return await this.shippingProfileService_.fetchCartOptions(this.cart_)
  }

  async #fetchRates() {
    const params = await this.#buildRequestParams()
    const { parcel } = params
    const fulfillmentOptions = this.shippingOptions_.map((so) => so.data)

    return await this.shippo_.useClient.liverates
      .create(params)
      .then((rates) =>
        rates.results
          .filter((rate) =>
            fulfillmentOptions.find((fo) => fo.name === rate.title && true)
          )
          .map((rate) => ({ ...rate, parcel }))
      )
      .catch((e) => console.error(e))
  }

  #findRate(shippingOption, rates) {
    return rates.find((rate) => rate.title === shippingOption.data.name)
  }

  async #formatLineItems() {
    return await Promise.all(
      this.cart_.items.map(
        async (item) =>
          await this.totalsService_
            .getLineItemTotals(item, this.cart_)
            .then((totals) =>
              shippoLineItem(
                item,
                totals.unit_price,
                this.cart_.region.currency_code
              )
            )
      )
    )
  }

  async #isCartReady() {
    if (!this.cart_.email || this.cart_.items.length === 0) {
      return false
    }
    return await this.#validateAddress()
  }

  async #packBins() {
    const packed = await this.shippoPackerService_.packBins(this.cart_.items)

    this.packerResult_ = packed
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
      !!this.shippingOptions_.find((so) => so.data?.type === "LIVE_RATE") &&
      true
    )
  }

  #setCart(cart) {
    this.cart_ = cart
  }

  #setOptions(options) {
    this.shippingOptions_ = options
  }

  async #setOptionPrices() {
    const options = await this.pricingService_.setShippingOptionPrices(
      this.shippingOptions_,
      {
        cart_id: this.cart_.id,
      }
    )

    this.#setOptions(options)
  }

  async #setProps(cartId) {
    this.#setCart(await this.#fetchCart(cartId))
    this.#setOptions(await this.#fetchOptions())
  }

  async #validateAddress() {
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

  async decorateOptions(cartId, options) {
    this.#setCart(await this.#fetchCart(cartId))
    this.#setOptions(options)

    const cartIsReady = await this.#isCartReady()
    const requiresRates = await this.#requiresRates()

    if (cartIsReady && requiresRates) {
      await this.#applyRates()
    }
    await this.#setOptionPrices()
    return this.shippingOptions_
  }
}

export default ShippoRatesService
