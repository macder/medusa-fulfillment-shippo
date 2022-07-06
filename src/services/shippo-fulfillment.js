import { FulfillmentService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"
import { shippoAddress, shippoLineItem, shippoOrder } from "../utils/formatters"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  constructor(
    {
      cartService,
      customShippingOptionRepository,
      customShippingOptionService,
      manager,
      orderService,
      pricingService,
      shippingOptionService,
      shippingProfileService,
      shippoClientService,
      shippoPackerService,
      totalsService,
    },
    options
  ) {
    super()

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {CustomShippingOptionRepository} */
    this.customShippingOptionRepository_ = customShippingOptionRepository

    /** @private @const {CustomShippingOptionService} */
    this.customShippingOptionService_ = customShippingOptionService

    /** @private @const {Manager} */
    this.manager_ = manager

    /** @private @const {OrderService} */
    this.orderService_ = orderService

    /** @private @const {PricingService} */
    this.pricingService_ = pricingService

    /** @private @const {ShippingOptionService} */
    this.shippingOptionService_ = shippingOptionService

    /** @private @const {ShippingProfileService} */
    this.shippingProfileService_ = shippingProfileService

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService

    /** @private @const {ShippoPackerService_} */
    this.shippoPackerService_ = shippoPackerService

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
    console.log(
      "*******validateFulfillmentData: optionData",
      JSON.stringify(optionData, null, 2)
    )
    console.log(
      "*******validateFulfillmentData: data",
      JSON.stringify(data, null, 2)
    )
    console.log(
      "*******validateFulfillmentData: cart",
      JSON.stringify(cart, null, 2)
    )

    // if (optionData.type === "LIVE_RATE" && cart?.id) {
    //   throw new MedusaError(
    //     MedusaError.Types.NOT_ALLOWED,
    //     "Cannot use live rate option before requesting rate. " +
    //       "Try POST /store/shipping-options/:cart_id/shippo/rates. " +
    //       "See README.md",
    //     MedusaError.Codes.CART_INCOMPATIBLE_STATE
    //   )
    // }

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
    lineItems.forEach((item) => {
      if (item.quantity < 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${item.title} quantity: ${item.quantity}`
        )
      }
    })

    const parcelName =
      fromOrder.metadata.shippo?.parcel_template_name ?? "Package Name N/A"

    return await this.shippo_
      .createOrder(
        await shippoOrder(fromOrder, fulfillment, lineItems, parcelName)
      )
      .then((response) => ({
        shippo_order_id: response.object_id,
        shipping_methods: fromOrder.shipping_methods.map((e) => e.id),
      }))
      .catch((e) => {
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
      })
  }

  async cancelFulfillment(fulfillment) {
    return Promise.resolve({})
  }

  async canCalculate(data) {
    return data.type === "LIVE_RATE"
  }


  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {
    console.log("*******************************calculatePrice: ", cart)

    if (!this.rates_) {
      this.test()
    }

    console.log(this.rates_)

    throw "dev lock"

    // return 5000
    // derp...
    // throw new MedusaError(
    //   MedusaError.Types.NOT_ALLOWED,
    //   "The customer would like to know the price before making a choice. " +
    //     "Try POST /store/shipping-options/:cart_id/shippo/rates " +
    //     "See README.md",
    //   MedusaError.Codes.CART_INCOMPATIBLE_STATE
    // )
  }

  async createReturn(fromData) {
    return Promise.resolve({})
  }

  // async fetchLiveRates(cartId) {
  //   const cart = await this.retrieveCart_(cartId)
  //   const shippingOptions = await this.shippingProfileService_.fetchCartOptions(
  //     cart
  //   )

  //   /** **************************************************************** */
  //   // IS ADDRESS COMPLETE?

  //   if (!cart.email) {
  //     // console.log("missing email")
  //     return shippingOptions
  //   }

  //   const requiredFields = [
  //     "first_name",
  //     "last_name",
  //     "address_1",
  //     "city",
  //     "country_code",
  //     // "province",
  //     "postal_code",
  //     // "phone",
  //   ]
  //   const emptyFields = requiredFields.filter(
  //     (field) => !cart.shipping_address[field]
  //   )

  //   if (emptyFields.length > 0) {
  //     return shippingOptions
  //   }

  //   // console.log(cart.shipping_address)

  //   /** ******************************************************************* */

  //   // CART HAS ITEMS?

  //   if (cart.items.length === 0) {
  //     // console.log("cart is empty")
  //     return shippingOptions
  //   }

  //   /** ****************************************************************** */

  //   // CART HAS EMAIL, ADDRESS, AND ITEMS

  //   const toAddress = await shippoAddress(cart.shipping_address, cart.email)

  //   const lineItems = await this.formatLineItems_(cart.items, cart)

  //   this.binPackResults_ = await this.shippo_
  //     .fetchCustomParcelTemplates()
  //     .then(
  //       async (parcels) =>
  //         await this.shippoPackerService_.packBins(cart.items, parcels)
  //     )

  //   const rates = await this.shippo_.fetchLiveRates(
  //     shippingOptions,
  //     toAddress,
  //     lineItems,
  //     this.binPackResults_[0]?.object_id
  //   )

  //   return shippingOptions.map((so) => {
  //     const soRate = rates.find((rate) => rate.title === so.data.name && true)
  //     const price = soRate ? this.getPrice_(soRate) : so.amount
  //     return { ...so, amount: price }
  //   })
  // }

  async retrievePackerResults(order_id) {
    const order = await this.orderService_.retrieve(order_id)

    if (order.metadata.shippo?.custom_shipping_options) {
      const cso_id = order.metadata.shippo.custom_shipping_options[0]
      return await this.customShippingOptionService_
        .retrieve(cso_id)
        .then((cso) => cso.metadata.shippo_binpack)
    }
    return { error: "This order has no packer data available" }
  }

  async updateShippingRates(cartId) {
    const cart = await this.retrieveCart_(cartId)
    const rates = await this.fetchLiveRates(cartId)

    // const customShippingOptions = await this.customShippingOptionService_
    //   .list({ cart_id: cartId })
    //   .then(async (cartCustomShippingOptions) => {
    //     if (cartCustomShippingOptions.length > 0) {
    //       await this.removeCustomShippingOptions_(cartCustomShippingOptions)
    //     }

    //     const shippingOptions =
    //       await this.shippingProfileService_.fetchCartOptions(cart)

    //     return await Promise.all(
    //       shippingOptions.map(async (shippingOption) => {
    //         const liveRate = this.findRate_(shippingOption, rates) ?? null

    //         const price = liveRate
    //           ? this.getPrice_(liveRate)
    //           : shippingOption.amount

    //         return await this.createCustomShippingOption_(
    //           shippingOption,
    //           price,
    //           cartId,
    //           liveRate
    //         )
    //       })
    //     ).then(async (customShippingOptions) => {
    //       this.setCartMeta_(
    //         cartId,
    //         customShippingOptions.filter(
    //           (cso) => cso?.metadata?.is_shippo_rate ?? false
    //         )
    //       )

    //       return customShippingOptions
    //     })
    //   })
    //   .catch((e) => {
    //     console.error(e)
    //   })

    // return customShippingOptions
  }

  async createCustomShippingOption_(shippingOption, price, cartId, liveRate) {
    return await this.customShippingOptionService_.create(
      {
        cart_id: cartId,
        shipping_option_id: shippingOption.id,
        price,
      },
      {
        metadata: liveRate && {
          is_shippo_rate: true,
          ...liveRate,
          shippo_binpack: this.binPackResults_,
        },
      }
    )
  }

  async findShippingOptionTypes_(type, cart) {
    return await this.shippingProfileService_
      .fetchCartOptions(cart)
      .then((cartShippingOptions) =>
        cartShippingOptions.filter(
          (shippingOption) => shippingOption.data.type === type
        )
      )
  }

  findRate_(shippingOption, rates) {
    return rates.find((rate) => rate.title == shippingOption.data.name)
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

  getPrice_(rate) {
    // amount_local: calculated || amount: fallback
    const price = rate?.amount_local || rate.amount
    return parseInt(parseFloat(price) * 100, 10)
  }

  async removeCustomShippingOptions_(cartCustomShippingOptions) {
    const customShippingOptionRepo = await this.manager_.getCustomRepository(
      this.customShippingOptionRepository_
    )
    await customShippingOptionRepo.remove(cartCustomShippingOptions)
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

  async setCartMeta_(cartId, customShippingOptions) {
    const parcelId =
      customShippingOptions[0].metadata.shippo_binpack[0].object_id

    const parcelName = customShippingOptions[0].metadata.shippo_binpack[0].name

    const csoIds = customShippingOptions.map((e) => e.id)

    await this.cartService_.setMetadata(cartId, "shippo", {
      parcel_templace_id: parcelId,
      parcel_template_name: parcelName,
      custom_shipping_options: csoIds,
    })
  }
}

export default ShippoFulfillmentService
