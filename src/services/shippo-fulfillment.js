import { FulfillmentService } from "medusa-interfaces"
import { humanizeAmount, MedusaError, getConfigFile } from "medusa-core-utils"
import shippo from "shippo"
import { shippoAddress, shippoLineItem } from '../utils/shippo'

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = 'shippo'

  constructor({ addressRepository, cartService, totalsService }, options) {
    
    super()

    // for when released as an npm package
    this.options_ = options

    /** @private @const {AddressRepository} */
    this.addressRepository_ = addressRepository

    /** @private @const {CartService} */
    this.cartService_ = cartService

    /** @private @const {Shippo} */
    this.shippo_ = shippo(this.options_.api_key)

    /** @private @const {TotalsService} */
    this.totalsService_ = totalsService
  }

  async getFulfillmentOptions() {

    const shippingOptions = await this.shippo_.carrieraccount.list(
      { service_levels: true,  results: 100 })
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

        const price = {
          total_price: 
            humanizeAmount(
              totals.subtotal,
              fromOrder.currency_code
          ),
          currency: fromOrder.currency_code
        }

        return {
          ...shippoLineItem(item, price),
          weight_unit: this.options_.weight_unit_type
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
      weight_unit: this.options_.weight_unit_type
    })
  }

  canCalculate(data) {
    return (data.type === 'LIVE_RATE')
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {

  }

  async createShippoAddress(address, email) {
    return await this.shippo_.address.create(shippoAddress(address, email))
  }
}

export default ShippoFulfillmentService;
