import path from "path"
import { FulfillmentService } from "medusa-interfaces"
import { humanizeAmount, getConfigFile, MedusaError } from "medusa-core-utils"
import { getParcel } from "../utils/client"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"
import { validateShippingAddress } from "../utils/validator"
import Shippo from "../utils/shippo"
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
    },
    options
  ) {
    super()

    const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
    const { projectConfig } = configModule

    // for when released as an npm package
    // this.options_ = options
    this.options_ = projectConfig

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {CustomShippingOptionService} */
    this.customShippingOptionService_ = customShippingOptionService

    this.customShippingOptionRepository_ = customShippingOptionRepository

    this.manager_ = manager

    console.log(customShippingOptionRepository)

    this.client_ = new Shippo(this.options_.api_key)
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

    return await this.client_
      .createOrder(await shippoOrder(fromOrder, lineItems))
      .then((response) => ({
        shippo_order_id: response.object_id,
        // shippo_parcel: shippoParcel.object_id,
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  canCalculate(data) {
    return data.type === "LIVE_RATE"
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) { }

  async fetchLiveRates(cartId) {
    const cart = await this.retrieveCart_(cartId)

    // Validate if cart has a complete shipping address
    const validAddress = validateShippingAddress(cart.shipping_address)
    if (validAddress.error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        validAddress.error.details[0].message
      )
    }

    const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
      cart
    )

    const lineItems = await this.formatLineItems_(cart.items, cart)
    const toAddress = shippoAddress(cart.shipping_address, cart.email)

    const parcels = await binPacker(cart.items)

    return await this.client_.fetchLiveRates(
      toAddress,
      lineItems,
      shippingOptions,
      parcels[0]
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
          const customShippingOptionRepo =
            await this.manager_.getCustomRepository(
              this.customShippingOptionRepository_
            )

          await customShippingOptionRepo.remove(cartCustomShippingOptions)
        }

        return await Promise.all(
          shippingOptions.map(async (option) => {
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
                  // shippo_parcel: parcels[0],
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
