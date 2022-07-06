import { BaseService } from "medusa-interfaces"
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

  async decorateRates(shippingOptions, cart) {
    const toAddress = await this.formatShippingAddress_(cart)

    if (!toAddress || cart.items.length === 0) {
      return shippingOptions
    }

    const lineItems = await this.formatLineItems_(cart)
    const packer = await this.packBins_(cart.items)

    const rates = await this.shippo_
      .fetchLiveRates(
        shippingOptions,
        toAddress,
        lineItems,
        packer[0]?.object_id
      )
      .catch((e) => console.error(e))

    return shippingOptions.map((so) => {
      const rate = this.findRate_(so, rates)
      const price = rate ? this.getPrice_(rate) : so.amount
      return { ...so, amount: price }
    })
  }

  findRate_(shippingOption, rates) {
    return rates.find((rate) => rate.title == shippingOption.data.name)
  }

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

  async formatShippingAddress_(cart) {
    if (!cart.email) {
      return false
    }

    const requiredFields = [
      "first_name",
      "last_name",
      "address_1",
      "city",
      "country_code",
      // "province",
      "postal_code",
      // "phone",
    ]

    const emptyFields = requiredFields.filter(
      (field) => !cart.shipping_address[field]
    )

    if (emptyFields.length > 0) {
      return false
    }

    return await shippoAddress(cart.shipping_address, cart.email)
  }

  getPrice_(rate) {
    // amount_local: calculated || amount: fallback
    const price = rate?.amount_local || rate.amount
    return parseInt(parseFloat(price) * 100, 10)
  }

  async packBins_(items) {
    return await this.shippo_
      .fetchCustomParcelTemplates()
      .then(
        async (parcels) =>
          await this.shippoPackerService_.packBins(items, parcels)
      )
  }
}

export default ShippoRatesService
