import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"

class ShippoOrderService extends BaseService {
  #client

  #fulfillmentService

  #fulfillmentRepo

  #manager

  #shippo

  constructor({
    manager,
    fulfillmentRepository,
    fulfillmentService,
    shippoClientService,
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
    const shippoOrderId = await this.#getIdFromFulfillment(fulfillmentId)
    const order = await this.fetch(shippoOrderId)
    return order
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
    const shippoOrderId = await this.#getIdFromFulfillment(fulfillmentId)
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

  async findFulfillmentsBy(type, id) {
    const fulfillmentRepo = this.#manager.getCustomRepository(
      this.#fulfillmentRepo
    )

    const fulfillments = await fulfillmentRepo.find({
      where: {
        [type]: id,
      },
    })
    return fulfillments
  }

  async findBy(type, id) {
    const fulfillments = await this.findFulfillmentsBy(type, id)

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
    const fulfillments = await this.findFulfillmentsBy(type, id)

    const packingSlips = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const packingSlip = await this.fetchPackingSlipByFulfillmentId(
          fulfillment.id
        )
        const {
          id,
          data: { shippo_order_id },
        } = fulfillment

        return {
          ...packingSlip,
          shippo_order_id,
          fulfillment_id: id,
        }
      })
    )
    return packingSlips
  }

  async isReplace(id) {
    const order = await this.fetch(id)
    return order.order_number.includes("replace")
  }

  async #getIdFromFulfillment(fulfillmentOrId) {
    const fulfillment = fulfillmentOrId?.id
      ? fulfillmentOrId
      : await this.#fulfillmentService.retrieve(fulfillmentOrId)

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
