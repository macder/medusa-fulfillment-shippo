import { BaseService } from "medusa-interfaces"

class ShippoOrderService extends BaseService {
  #client
  #fulfillmentService
  #shippo
  #shippoTransactionService
  #fetchBy

  constructor(
    { fulfillmentService, shippoClientService, shippoTransactionService },
    options
  ) {
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
   * Fetches a shippo order by id
   * @param {string} id - shippo order id
   * @return {Promise.<Object>} shippo order
   */
  async fetch(id) {
    return await this.#client.order.retrieve(id)
  }

  /**
   * Fetches a shippo order by fulfillment ID
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchByFulfillmentId(fulfillmentId) {
    const shippoOrderId = await this.#getId(fulfillmentId)

    return await this.fetch(shippoOrderId).then(async (order) => {
      if (order.transactions.length) {
        const transactions = await Promise.all(
          order.transactions.map(async (ta) => {
            ta.is_return = await this.#shippoTransactionService.isReturn(
              ta.object_id
            )
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
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchPackingSlip(orderId) {
    return await this.#client.order.packingslip(orderId)
  }

  /**
   *
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchPackingSlipByFulfillmentId() {}

  /**
   *
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchByClaimId() {}

  /**
   *
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchByOrderId() {}

  /**
   *
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchByReturnId() {}

  /**
   *
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchByTransactionId() {}

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
