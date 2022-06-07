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
    
    return carriers.results
      .filter(e => e.active)
      .flatMap(item => item.service_levels
        .map(e => ({
          carrier_id: item.object_id,
          name: `${item.carrier_name} ${e.name}`,
          token: e.token,
          return_labels: e.supports_return_labels
        })
      )
    )
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

  calculatePrice() {
    return 2000 // testing...
  }
}

export default ShippoFulfillmentService;
