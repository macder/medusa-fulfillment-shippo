import { BaseService } from "medusa-interfaces"

class ShippoTrackService extends BaseService {
  #client

  #fulfillmentService

  #logger

  #shippo

  #shippoOrderService

  #shippoTransactionService

  constructor({
    fulfillmentService,
    logger,
    shippoClientService,
    shippoOrderService,
    shippoTransactionService,
  }) {
    super()

    /** @private @const {FulfillmentService} */
    this.#fulfillmentService = fulfillmentService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoOrderService} */
    this.#shippoOrderService = shippoOrderService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransactionService = shippoTransactionService

    this.#client = this.#shippo.useClient

    this.#logger = logger
  }

  /**
   * Fetches tracking status
   * @param {string} carrier - the carrier token name
   * @param {string} trackingNum - the tracking number
   * @return {Promise.<Object>} shippo tracking status
   */
  async fetch(carrier, trackingNum) {
    return this.#client.track.get_status(carrier, trackingNum).catch((e) => {
      this.#logger.error(e)
    })
  }

  /**
   * Fetches tracking status by Fulfillment ID
   * @param {string} fulfillmentId - the fulfillment to get tracking links for
   * @return {Promise.<Object>} shippo tracking status
   */
  async fetchByFulfillmentId(fulfillmentId) {
    const transactionId = await this.#shippoOrderService
      .fetchByFulfillmentId(fulfillmentId)
      .then(
        (order) =>
          order.transactions.find(
            (ta) => ta.is_return === false && ta.object_status === "SUCCESS"
          ).object_id
      )

    const transaction = await this.#fetchTransaction(transactionId)
    const carrierId = transaction.rate.carrier_account

    const carrier = await this.#client.carrieraccount
      .retrieve(carrierId)
      .then((response) => response.carrier)

    const fullfillment = await this.#fulfillmentService.retrieve(
      fulfillmentId,
      {
        relations: ["tracking_links"],
      }
    )
    const { tracking_number } = fullfillment.tracking_links.find(
      (tl) => tl.tracking_number === transaction.tracking_number
    )

    return this.fetch(carrier, tracking_number)
  }

  /**
   * Register webhook for a tracking status
   * @param {String} carrier - the carrier token name
   * @param {String} trackingNum - the tracking number
   * @param {String} [metadata] - optional metadata string, max 100 characters.
   * @return {Promise.<Object>} shippo tracking status
   */
  async registerWebhook(carrier, trackingNumber, metadata = "") {
    return this.#client.track.create({
      carrier,
      tracking_number: trackingNumber,
      metadata,
    })
  }

  async #fetchTransaction(id) {
    return this.#shippoTransactionService
      .fetch(id)
      .then(async (ta) =>
        this.#shippoTransactionService.fetchExtended(ta.object_id)
      )
  }
}

export default ShippoTrackService
