import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem } from "../utils/formatters"

class ShippoRatesService extends BaseService {
  #cartService

  #shippo

  #shippoPackageService

  #totalsService

  constructor({
    cartService,
    shippoClientService,
    shippoPackageService,
    totalsService,
  }) {
    super()

    /** @private @const {CartService} */
    this.#cartService = cartService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoPackageService} */
    this.#shippoPackageService = shippoPackageService

    /** @private @const {TotalsService} */
    this.#totalsService = totalsService
  }

  async fetchRates(cart) {
    const params = await this.#buildRequestParams(cart)
    const rates = await this.#shippo.useClient.liverates
      .create(params)
      .then((response) => response.results)
    return rates
  }

  async fetchOptionRate(option, cart) {
    const rate = this.#isReady(cart)
      ? await this.fetchRates(cart).then((response) =>
          response.find((r) => r.title === option.name)
        )
      : null

    return rate
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

  async #buildRequestParams(cart, parcelTemplate = null) {
    const parcelId =
      parcelTemplate ??
      (await this.#packBins(cart).then((result) => result[0].id))

    const toAddress = await shippoAddress(cart.shipping_address, cart.email)

    return {
      address_to: toAddress,
      line_items: await this.#formatLineItems(cart),
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

  async #formatLineItems(cart) {
    return Promise.all(
      cart.items.map(async (item) =>
        this.#totalsService
          .getLineItemTotals(item, cart)
          .then((totals) =>
            shippoLineItem(item, totals.unit_price, cart.region.currency_code)
          )
      )
    )
  }

  #isReady(cart) {
    if (!cart.email || cart.items.length === 0) {
      console.log("NOT READY")
      return false
    }
    return this.#validateAddress(cart.shipping_address)
  }

  async #packBins(cart) {
    const packed = await this.#shippoPackageService.packCart(cart.id)
    return packed
  }

  #validateAddress(address) {
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
