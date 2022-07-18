import { BaseService } from "medusa-interfaces"

class ShippoOrderService extends BaseService {
  #client
  #fulfillmentService
  #shippo
  #shippoTransactionService


  constructor({ fulfillmentService, shippoClientService, shippoTransactionService }, options) {
    super()

    /** @private @const {FulfillmentService} */
    this.#fulfillmentService = fulfillmentService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransactionService = shippoTransactionService

    this.#client = this.#shippo.useClient
  }

  /**
   * 
   * @param {string} 
   * @return {Object}
   */
  async fetch(id) {
    return await this.#client.order.retrieve(id)
  }

  /**
   * 
   * @param {string} 
   * @return {Object}
   */
  async fetchByFullfillmentId(fulfillmentId) {
    const shippoOrderId = await this.#getId(fulfillmentId)

    return await this.fetch(shippoOrderId)
      .then(async order => {
        if (order.transactions.length) {
          const transactions = await Promise.all(
            order.transactions.map(async ta => {
              ta.is_return = await this.#shippoTransactionService.isReturn(ta.object_id)
              return ta
            })
          )
          order.transactions = transactions
        }
        return order
      })
  }

  /**
   * 
   * @param {string} 
   * @return {Object}
   */
  async fetchByClaimId() {

  }

  /**
   * 
   * @param {string} 
   * @return {Object}
   */
  async fetchByOrderId() {

  }

  /**
   * 
   * @param {string} 
   * @return {Object}
   */
  async fetchByTransactionId() {

  }

  async #getId(fulfillmentId) {
    const fullfillment = await this.#fulfillmentService.retrieve(fulfillmentId)

    if (!fullfillment.data?.shippo_order_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shippo order not found for fulfillment with id: ${fulfillmentId}`
      )
    }

    const {
      data: { shippo_order_id },
    } = fullfillment

    return shippo_order_id
  }

}

export default ShippoOrderService
