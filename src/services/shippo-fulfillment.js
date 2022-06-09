import { FulfillmentService } from "medusa-interfaces"
import shippo from "shippo"

// TODO: move to medusa-config plugins array
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = 'shippo'

  constructor({ }, options) {
    super()

    this.shippo_ = shippo(SHIPPO_API_KEY)
  }

  async getFulfillmentOptions() {
    const carriers = await this.shippo_.carrieraccount.list({ service_levels: true, results: 100 })
    const groups = await this.shippo_.servicegroups.list()

    const services = carriers.results
      .filter(e => e.active)
      .flatMap(item => item.service_levels
        .map(e => {
          const { service_levels, ...shippingOption } = {
            id: `shippo-fulfillment-${e.token}`,
            name: `${item.carrier_name} ${e.name}`,
            type: 'service',
            ...item
          }
          return shippingOption
        })
      )

    const serviceGroups = groups.map(e => ({
      id: `shippo-fulfillment-${e.object_id}`,
      type: 'service_group',
      ...e
    }))

    return [...services, ...serviceGroups]


  }

  async validateOption(data) {
    return true
  }

  async validateFulfillmentData(optionData, data, cart) {
    return {
      ...data
    }
  }

  createFulfillment(
    methodData,
    fulfillmentItems,
    fromOrder,
    fulfillment
  ) {
    // No data is being sent anywhere
    return Promise.resolve({})
  }

  canCalculate(data) {
    return true
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {
    return 2000 // testing...
  }
}

export default ShippoFulfillmentService;
