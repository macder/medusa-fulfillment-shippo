import { BaseService } from "medusa-interfaces"

class ShippoOrderService extends BaseService {
  #client

  #error

  #fulfillmentService

  #fulfillmentRepo

  #manager

  #shippo

  #helper

  #shippoTransactionService

  constructor({
    manager,
    fulfillmentRepository,
    fulfillmentService,
    shippoClientService,
    shippoHelper,
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

    this.#helper = (entity) => shippoHelper[entity]

    this.#error = shippoHelper.error
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
    const shippoOrderId = await this.#helper("fulfillment").shippoId(
      fulfillmentId
    )

    if (!shippoOrderId) {
      return this.#error("shippo_order").notFoundFor([
        "fulfillment",
        fulfillmentId,
      ])
    }

    const shippoOrder = await this.fetch(shippoOrderId).then(async (order) => {
      if (order?.transactions?.length) {
        const transactions = await Promise.all(
          order.transactions.map(async (ta) => {
            const is_return = await this.#shippoTransactionService.isReturn(
              ta.object_id
            )
            return { ...ta, is_return }
          })
        )
        return { ...order, transactions }
      }
      return order
    })
    return shippoOrder
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
    const shippoOrderId = await this.#helper("fulfillment").shippoId(
      fulfillmentId
    )
    return shippoOrderId
      ? this.fetchPackingSlip(shippoOrderId)
      : this.#error("shippo_order").notFoundFor(["fulfillment", fulfillmentId])
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
      return this.#error("fulfillment").notFoundFor(["shippo order", orderId])
    }

    return fulfillment[0]
  }

  async findFulfillmentsBy(type, id) {
    const fulfillmentRepo = this.#manager.getCustomRepository(
      this.#fulfillmentRepo
    )

    const fulfillments = await fulfillmentRepo.find({
      where: {
        [`${type}_id`]: id,
      },
    })
    return fulfillments
  }

  async findBy(type, id) {
    const fulfillments = await this.findFulfillmentsBy(type, id).then(
      (response) => response.filter((ful) => ful.data.shippo_order_id)
    )

    if (fulfillments.length === 0) {
      return this.#error("shippo_order").notFoundFor([type, id])
    }

    const orders = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const order = await this.fetchByFulfillmentId(fulfillment.id)
        return {
          ...order,
          fulfillment_id: fulfillment.id,
        }
      })
    )
    return orders
  }

  async findPackingSlipBy(type, id) {
    const fulfillments = await this.findFulfillmentsBy(type, id).then(
      (response) => response.filter((ful) => ful.data.shippo_order_id)
    )

    if (fulfillments.length === 0) {
      return this.#error("shippo_order").notFoundFor([type, id])
    }

    return Promise.all(
      fulfillments.map(async (fulfillment) => {
        const packingSlip = await this.fetchPackingSlipByFulfillmentId(
          fulfillment.id
        )
        return {
          ...packingSlip,
          shippo_order_id: fulfillment.data.shippo_order_id,
          fulfillment_id: fulfillment.id,
        }
      })
    )
  }

  async isReplace(id) {
    const order = await this.fetch(id)
    return order.order_number.includes("replace")
  }
}

export default ShippoOrderService
