import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"

class ShippoOrderService extends BaseService {
  #client

  #fulfillmentService

  #fulfillmentRepo

  #manager

  #shippo

  #shippoTransactionService

  constructor({
    manager,
    fulfillmentRepository,
    fulfillmentService,
    shippoClientService,
    shippoTransactionService,
  }) {
    super()

    /** @private @const {FulfillmentRepository} */
    this.#fulfillmentRepo = fulfillmentRepository

    /** @private @const {FulfillmentService} */
    this.#fulfillmentService = fulfillmentService

    /** @private @const {Manager} */
    this.#manager = manager

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
    return this.#client.order.retrieve(id)
  }

  /**
   * Fetches a shippo order by fulfillment ID
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchByFulfillmentId(fulfillmentId) {
    const shippoOrderId = await this.#getId(fulfillmentId)

    return this.fetch(shippoOrderId).then(async (order) => {
      if (order?.transactions?.length) {
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
    return this.#client.order.packingslip(orderId)
  }

  /**
   *
   * @param {String}
   * @return {Promise.<Object>}
   */
  async fetchPackingSlipByFulfillmentId(fulfillmentId) {
    const shippoOrderId = await this.#getId(fulfillmentId)
    return this.fetchPackingSlip(shippoOrderId)
  }

  /**
   *
   * @param {String} orderId - shippo order object_id
   * @return {Promise.<Object>}
   */
  async findFulfillment(orderId) {
    const fulfillmentRepo = this.#manager.getCustomRepository(
      this.#fulfillmentRepo
    )

    const fulfillment = await fulfillmentRepo.find({
      relations: ["tracking_links"],
      where: {
        data: {
          shippo_order_id: orderId,
        },
      },
    })

    if (!fulfillment.length) {
      return Promise.reject(
        new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Fulfillment for shippo order with id: ${orderId} not found`
        )
      )
    }
    return fulfillment[0]
  }

  async isReplace(id) {
    const order = await this.fetch(id)
    return order.order_number.includes("replace")
  }

  async #getId(fulfillmentId) {
    const fulfillment = await this.#fulfillmentService.retrieve(fulfillmentId)

    if (!fulfillment.data?.shippo_order_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shippo order not found for fulfillment with id: ${fulfillmentId}`
      )
    }

    const {
      data: { shippo_order_id },
    } = fulfillment

    return shippo_order_id
  }
}

export default ShippoOrderService
