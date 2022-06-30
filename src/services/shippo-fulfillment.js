import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor(
    {
      binPackerService,
      cartService,
      customShippingOptionService,
      customShippingOptionRepository,
      shippingProfileService,
      manager,
      totalsService,
      shippoClientService,
    },
    options
  ) {
    super()

    /** @private @const {BinPackerService_} */
    this.binPackerService_ = binPackerService

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {CustomShippingOptionService} */
    this.customShippingOptionService_ = customShippingOptionService

    /** @private @const {CustomShippingOptionRepository} */
    this.customShippingOptionRepository_ = customShippingOptionRepository

    /** @private @const {Manager} */
    this.manager_ = manager

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    /** @public @const {} */
    this.useClient = this.shippo_.getClient()

    this.binPackResults_ = []
  }

  async getFulfillmentOptions() {
    return await this.shippo_.retrieveFulfillmentOptions()
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
    const lineItems = await this.formatLineItems_(fulfillmentItems, fromOrder)
    const parcelName = fromOrder.metadata.shippo.parcel_template_name ?? "N/A"

    return await this.shippo_
      .createOrder(await shippoOrder(fromOrder, lineItems, parcelName))
      .then((response) => ({
        shippo_order_id: response.object_id,
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  async cancelFulfillment(fulfillment) {
    return Promise.resolve({})
  }

  canCalculate(data) {
    return data.type === "LIVE_RATE"
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {}

  async fetchLiveRates(cartId) {
    const cart = await this.retrieveCart_(cartId)
    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )

    const lineItems = await this.formatLineItems_(cart.items, cart)

    const toAddress = await shippoAddress(
      cart.shipping_address,
      cart.email
    ).catch((e) => e)

    this.binPackResults_ = await this.shippo_
      .fetchCustomParcelTemplates()
      .then(
        async (parcels) =>
          await this.binPackerService_.packBins(cart.items, parcels)
      )

    return await this.shippo_
      .fetchLiveRates(
        toAddress,
        lineItems,
        shippingOptions,
        this.binPackResults_[0]?.object_id
      )
      .then((response) =>
        response.map((rate) => ({
          ...rate,
          parcel_template: this.binPackResults_[0]?.object_id,
        }))
      )
  }

  async updateShippingRates(cartId) {
    const cart = await this.retrieveCart_(cartId)
    const rates = await this.fetchLiveRates(cartId)

    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )

    const customShippingOptions = await this.customShippingOptionService_
      .list({ cart_id: cartId })
      .then(async (cartCustomShippingOptions) => {
        if (cartCustomShippingOptions.length) {
          await this.removeCustomShippingOptions_(cartCustomShippingOptions)
        }

        return await Promise.all(
          shippingOptions
            .filter((e) => e.data.type === "LIVE_RATE")
            .map(async (option) => {
              const optionRate = rates.find(
                (rate) => rate.title == option.data.name
              )

              const price = optionRate.amount_local || optionRate.amount

              return await this.customShippingOptionService_.create(
                {
                  cart_id: cartId,
                  shipping_option_id: option.id,
                  price: parseInt(parseFloat(price) * 100),
                },
                {
                  metadata: {
                    is_shippo_rate: true,
                    ...optionRate,
                    shippo_binpack: this.binPackResults_,
                  },
                }
              )
            })
        ).then(async (customShippingOption) => {
          const parcelId =
            customShippingOption[0].metadata.shippo_binpack[0].object_id

          const parcelName =
            customShippingOption[0].metadata.shippo_binpack[0].name

          const csoIds = [...Array(customShippingOption.length).keys()].map(
            (e) => customShippingOption[e].id
          )

          await this.cartService_.setMetadata(cartId, "shippo", {
            parcel_templace_id: parcelId,
            parcel_template_name: parcelName,
            custom_shipping_options: csoIds,
          })
          return customShippingOption
        })
      })
      .catch((e) => {
        console.error(e)
      })

    return customShippingOptions
  }

  async removeCustomShippingOptions_(cartCustomShippingOptions) {
    const customShippingOptionRepo = await this.manager_.getCustomRepository(
      this.customShippingOptionRepository_
    )

    await customShippingOptionRepo.remove(
      cartCustomShippingOptions.filter(
        (option) => option.metadata.is_shippo_rate
      )
    )
  }

  async formatLineItems_(items, order) {
    return await Promise.all(
      items.map(
        async (item) =>
          await this.totalsService_
            .getLineItemTotals(item, order)
            .then((totals) =>
              shippoLineItem(
                item,
                totals.unit_price,
                order.region.currency_code
              )
            )
      )
    )
  }

  async retrieveCart_(id) {
    return await this.cartService_.retrieve(id, {
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
  }
}

export default ShippoFulfillmentService
