import { FulfillmentService } from "medusa-interfaces"
import { humanizeAmount, MedusaError } from "medusa-core-utils"
import shippo from "shippo"

// TODO: move to medusa-config plugins array
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY
const SHIPPO_DEFAULT_SENDER_ADDRESS_ID = process.env.SHIPPO_DEFAULT_SENDER_ADDRESS_ID
const WEIGHT_UNIT_TYPE = 'g'
const DIMENSION_UNIT_TYPE = 'cm'

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = 'shippo'

  constructor({ addressRepository, cartService, totalsService }, options) {

    super()

    /** @private @const {AddressRepository} */
    this.addressRepository_ = addressRepository

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {Shippo} */
    this.shippo_ = shippo(SHIPPO_API_KEY)

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService
  }

  async getFulfillmentOptions() {
    const shippingOptions = await this.shippo_.carrieraccount.list(
      { service_levels: true, results: 100 })
      .then(r => r.results.filter(e => e.active)
        .flatMap(item => item.service_levels
          .map(e => {
            const { service_levels, ...shippingOption } = {
              ...e,
              id: `shippo-fulfillment-${e.token}`,
              name: `${item.carrier_name} ${e.name}`,
              carrier_id: item.object_id,
              is_group: false,
              ...item
            }
            return shippingOption
          })
        )
      )

    const returnOptions = shippingOptions
      .filter(e => e.supports_return_labels)
      .map(e => ({
        ...e,
        name: `${e.name} - Support return labels`,
        is_return: true,

      }))

    const shippingOptionGroups = await this.shippo_.servicegroups.list()
      .then(r => r.map(e => ({
        id: `shippo-fulfillment-${e.object_id}`,
        is_group: true,
        ...e
      })))

    return [...shippingOptions, ...shippingOptionGroups, ...returnOptions]
  }

  async validateOption(data) {
    return true
  }

  async validateFulfillmentData(optionData, data, cart) {
    return {
      ...data
    }
  }

  async createFulfillment(
    methodData,
    fulfillmentItems,
    fromOrder,
    fulfillment
  ) {
    const toAddress = await this.createShippoAddress(fromOrder.shipping_address, fromOrder.email)

    const lineItems = await Promise.all(
      fulfillmentItems.map(async item => {
        const totals = await this.totalsService_.getLineItemTotals(
          item,
          fromOrder,
          {
            include_tax: true,
            use_tax_lines: true,
          }
        )

        return {
          quantity: item.quantity,
          sku: item.variant.sku,
          title: item.variant.product.title,
          total_price:
            humanizeAmount(
              totals.subtotal,
              fromOrder.currency_code
            ),
          currency: fromOrder.currency_code,
          weight: item.variant.weight,
          weight_unit: WEIGHT_UNIT_TYPE
        }
      })
    )

    const totalWeight = lineItems
      .map(e => e.weight * e.quantity)
      .reduce((sum, current) => sum + current, 0)

    const shippoOrder = await this.shippo_.order.create({
      order_id: fromOrder.id,
      to_address: toAddress.object_id,
      line_items: lineItems,
      placed_at: fromOrder.created_at,
      shipping_cost: humanizeAmount(
        fromOrder.shipping_methods[0].price,
        fromOrder.currency_code
      ),
      shipping_cost_currency: fromOrder.currency_code,
      shipping_method: fromOrder.shipping_methods[0].shipping_option.name,
      weight: totalWeight,
      weight_unit: WEIGHT_UNIT_TYPE
    })
  }

  canCalculate(data) {
    return true
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {
    // tbh, medusa invokes this method after the user adds a shipping method to their cart.
    // the user probably wanted to see the shipping price prior to selecting it....
    // so, this is probably best to do via the frontend by using shippos "rates at checkout api"
    // https://goshippo.com/docs/reference/bash#rates-at-checkout-create
    // this plugin will include an api endpoint for this to make it easier

    const { shipping_address: shippingAddress } = await this.cartService_.retrieve(cart.id, {
      relations: ["shipping_address"],
    })

    const shippoAddress = await this.createShippoAddress(shippingAddress, cart.email)

    const shippoShipment = await this.shippo_.shipment.create({
      address_to: shippoAddress.object_id,
      address_from: SHIPPO_DEFAULT_SENDER_ADDRESS_ID,
      parcels: {
        "length": "10",
        "width": "15",
        "height": "10",
        "distance_unit": "in",
        "weight": "1",
        "mass_unit": "lb"
      },
      carrier_accounts: [
        fulfillmentOption.carrier_id
      ],
      async: false
    })

    if (shippoShipment.rates) {
      const rate = shippoShipment.rates.filter(
        e => e.servicelevel.token == fulfillmentOption.token
      )
      return parseFloat(rate[0].amount_local) * 100
    }

    return false // should have a fallback flatrate... expects an integer return
  }

  async createShippoAddress(address, email) {
    return await this.shippo_.address.create({
      "name": `${address.first_name} ${address.last_name}`,
      "company": address.company,
      "street1": address.address_1,
      "street2": address?.address_2,
      "street3": address?.address_3,
      "city": address.city,
      "state": address.province,
      "zip": address.postal_code,
      "country": address.country_code, // iso2 country code
      "phone": address.phone,
      "email": email,
      "validate": (address.country_code == 'us') ?? true,
    })
  }
}

export default ShippoFulfillmentService;
