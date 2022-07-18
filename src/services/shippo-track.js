import { BaseService } from "medusa-interfaces"

class ShippoTrackService extends BaseService {
  #client
  #fulfillmentService
  #shippo
  #shippoOrderService
  #shippoTransactionService

  constructor(
    {
      fulfillmentService,
      shippoClientService,
      shippoOrderService,
      shippoTransactionService,
    },
    options
  ) {
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
  }

  /**
   * Fetches tracking status
   * @param {string} carrier - the carrier token name
   * @param {string} trackingNum - the tracking number
   * @return {Promise.<Object>} shippo tracking status
   */
  async fetch(carrier, trackingNum) {
    return await this.#client.track.get_status(carrier, trackingNum)
  }

  /**
   * Fetches tracking status by Fulfillment ID
   * @param {string} fulfillmentId - the fulfillment to get tracking links for
   * @return {Promise.<Object>} shippo tracking status
   */
  async fetchByFulfillmentId(fulfillmentId) {
    const transactionId = await this.#shippoOrderService
      .fetchByFullfillmentId(fulfillmentId)
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

    const trackingNum = fullfillment.tracking_links.find(
      (tl) => tl.tracking_number === transaction.tracking_number
    ).tracking_number

    return await this.fetch(carrier, trackingNum)
  }

  async #fetchTransaction(id) {
    return await this.#shippoTransactionService
      .fetch(id)
      .then(
        async (ta) => await this.#shippoTransactionService.fetchExtended(ta)
      )
  }

  async registerWebhook(carrier, trackingNumber) {
    return await this.#client.track.create({
      carrier,
      tracking_number: trackingNumber,
    })
  }

  async addMetaData() {}
}

export default ShippoTrackService
