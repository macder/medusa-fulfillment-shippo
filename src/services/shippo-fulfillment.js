import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"
import { binPacker } from "../utils/bin-packer"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor(
    {
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

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

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

    /** @public @const {} */
    this.useClient = this.shippo_.getClient()
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
    const parcel = await this.shippo_.fetchCustomParcel(
      fromOrder.metadata.shippo_parcel_template
    )

    return await this.shippo_
      .createOrder(await shippoOrder(fromOrder, lineItems, parcel))
      .then((response) => ({
        shippo_order_id: response.object_id,
        shippo_parcel_template: fromOrder.metadata.shippo_parcel_template,
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

    const parcels = await this.shippo_.fetchCustomParcelTemplates()
    const packedParcels = await binPacker(cart.items, parcels)

    const shippoRes = await this.shippo_
      .fetchLiveRates(toAddress, lineItems, shippingOptions, packedParcels[0])
      .then((response) =>
        response.map((rate) => ({ ...rate, parcel_template: packedParcels[0] }))
      )
      .catch((e) => e)

    return shippoRes
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
          shippingOptions.map(async (option) => {
            const optionRate = rates.find(
              (rate) => rate.title == option.data.name
            )

            const price = optionRate.amount_local || optionRate.amount

            await this.cartService_.setMetadata(
              cartId,
              "shippo_parcel_template",
              optionRate.parcel_template
            )

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
                },
              }
            )
          })
        )
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
