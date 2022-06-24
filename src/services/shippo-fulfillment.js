import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"
// import { validateShippingAddress } from "../utils/validator"
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

    this.options_ = options

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {CustomShippingOptionService} */
    this.customShippingOptionService_ = customShippingOptionService

    /** @private @const {CustomShippingOptionRepository_} */
    this.customShippingOptionRepository_ = customShippingOptionRepository

    /** @private @const {Manager} */
    this.manager_ = manager

    this.client_ = shippoClientService

    this.useClient = this.client_.getClient()
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

    const lineItems = await this.formatLineItems_(fulfillmentItems, fromOrder)
    const parcel = await this.client_.fetchCustomParcel(
      fromOrder.metadata.shippo_parcel_template
    )

    return await this.client_
      .createOrder(shippoOrder(fromOrder, lineItems, parcel))
      .then((response) => ({
        shippo_order_id: response.object_id,
        shippo_parcel_template: fromOrder.metadata.shippo_parcel_template,
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  canCalculate(data) {
    return data.type === "LIVE_RATE"
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {}

  async fetchLiveRates(cartId) {
    const cart = await this.retrieveCart_(cartId)

    // Validate if cart has a complete shipping address
    // const validAddress = validateShippingAddress(cart.shipping_address)
    // if (validAddress.error) {
    //   throw new MedusaError(
    //     MedusaError.Types.INVALID_DATA,
    //     validAddress.error.details[0].message
    //   )
    // }

    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )

    const lineItems = await this.formatLineItems_(cart.items, cart)
    const toAddress = shippoAddress(cart.shipping_address, cart.email)

    const parcels = await this.client_.fetchCustomParcelTemplates()
    const packedParcels = await binPacker(cart.items, parcels)

    return await this.client_
      .fetchLiveRates(toAddress, lineItems, shippingOptions, packedParcels[0])
      .then((response) =>
        response.map((rate) => ({ ...rate, parcel_template: packedParcels[0] }))
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
