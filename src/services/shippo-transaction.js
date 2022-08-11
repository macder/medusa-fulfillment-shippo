import { BaseService } from "medusa-interfaces"
import { MedusaError } from "medusa-core-utils"

class ShippoTransactionService extends BaseService {
  #client

  #fulfillmentService

  #logger

  #orderService

  #shippo

  #transaction

  constructor({
    fulfillmentService,
    logger,
    orderService,
    shippoClientService,
  }) {
    super()

    /** @private @const {FulfillmentService} */
    this.#fulfillmentService = fulfillmentService

    /** @private @const {OrderService} */
    this.#orderService = orderService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {Shippo} */
    this.#client = this.#shippo.useClient

    this.#logger = logger
  }

  /**
   * Fetch a transaction
   * Shorthand for client.transaction.retrieve(id)
   * @param {string} id - shippo transaction id
   * @return {Promise.<object>} The transaction
   */
  async fetch(id) {
    if (this.#transaction?.object_id !== id) {
      this.#transaction = await this.#client.transaction.retrieve(id)
    }
    return this.#transaction
  }

  /**
   * Fetch transactions by fulfillment id
   * @param {string} id - fulfillment id
   * @return {Promise.<object[]>} Transactions
   */
  async fetchByFulfillment(id) {
    const {
      data: { shippo_order_id },
    } = await this.#fulfillmentService.retrieve(id)

    const { transactions } = await this.#client.order.retrieve(shippo_order_id)

    return Promise.all(
      transactions.map(async (ta) =>
        this.#client.transaction.retrieve(ta.object_id)
      )
    )
  }

  /**
   * Fetch all transactions related to an {Order}
   * @param {string} orderId - order_id
   * @return {Promise.<object[]>} The transaction
   */
  async fetchByOrder(orderId) {
    const order = await this.#orderService.retrieve(orderId, {
      relations: ["fulfillments"],
    })

    // TODO - Break this apart?
    const transacts = await Promise.all(
      // filter fulfillments with shippo order
      order.fulfillments
        .filter((ful) => ful.data?.shippo_order_id)
        // map transactions over fulfillments
        .map(async ({ id, data: { shippo_order_id } }) =>
          // fetch the fulfillment's shippo order
          this.#client.order
            .retrieve(shippo_order_id)
            .then(async ({ transactions }) =>
              Promise.all(
                // map the full transactions over shippoOrder.transactions
                transactions.map(async (ta) =>
                  this.#client.transaction
                    .retrieve(ta.object_id)
                    // add the fulfillment_id to transaction
                    .then((final) => ({ fulfillment_id: id, ...final }))
                )
              )
            )
        )
    )
    return transacts.flat(1)
  }

  /**
   * Fetch the extended version of a transaction
   * @param {string} transactionId - shippo transaction id
   * @return {Promise.<object>} The extended transaction
   */
  async fetchExtended(transactionId) {
    const order = await this.findOrder(transactionId)
    const urlQuery = `?q=${order.display_id}&expand[]=rate&expand[]=parcel`
    const transactions = await this.#client.transaction
      .search(urlQuery)
      .then((response) => response.results)

    return transactions.find(({ object_id }) => object_id === transactionId)
  }

  /**
   * Fetch extended version of a transaction by order id
   * @param {string} id - fulfillment id
   * @return {Promise.<object[]>} list of extended transactions
   */
  async fetchExtendedByFulfillment(id) {
    const {
      data: { shippo_order_id },
    } = await this.#fulfillmentService.retrieve(id)

    const { transactions } = await this.#client.order.retrieve(shippo_order_id)

    return Promise.all(
      transactions.map(async (ta) => this.fetchExtended(ta.object_id))
    )
  }

  /**
   * Fetch extended transactions by order id
   * @param {string} id - order id
   * @return {Promise.<object[]>} list of extended transactions
   */
  async fetchExtendedByOrder(id) {
    const order = await this.#orderService.retrieve(id)
    const urlQuery = `?q=${order.display_id}&expand[]=rate&expand[]=parcel`
    return this.#client.transaction
      .search(urlQuery)
      .then((response) => response.results)
  }

  async pollExtended(transactionId) {
    const poller = this.#shippo.poll
    const fetch = async () => this.fetchExtended(transactionId)

    const validator = () => (response) =>
      response?.object_state === "VALID" ||
      response?.object_status === "SUCCESS"
    return poller({
      fn: fetch,
      validate: validator(),
      interval: 3500,
      maxAttempts: 3,
    }).catch((e) => {
      this.#logger.error(e)
    })
  }

  /**
   * Finds the fulfillment associated with the transaction
   * @param {string} transactionId - shippo transaction id
   * @return {Promise.<Fulfillment>} The fulfillment related to this transaction
   */
  async findFulfillment(transactionId) {
    const order = await this.findOrder(transactionId)
    const { claims, swaps } = order

    const fulfillments = order?.fulfillments.concat(
      [...Array(claims?.length).keys()].flatMap((i) => claims[i]?.fulfillments),
      [...Array(swaps?.length).keys()].flatMap((i) => swaps[i]?.fulfillments)
    )

    return fulfillments.find(
      ({ data: { shippo_order_id } }) =>
        shippo_order_id === this.#transaction.order
    )
  }

  /**
   * Finds the order associated with the transaction
   * @param {string|object} transaction - shippo transaction id or object
   * @return {Order} The order related to this transaction
   */
  async findOrder(transactionId) {
    const transaction = await this.fetch(transactionId)
    const orderDisplayId = await this.constructor.#parseOrderDisplayId(
      transaction
    )
    return this.#retrieveOrderByDisplayId(orderDisplayId)
  }

  /**
   * @experimental - since 0.19.0
   * @propsed - for 0.20.0 or later
   * @param {Order} order
   * @return {}
   */
  async fetchReturnByOrder(order) {
    const transactions = await this.fetchExtendedByOrder(order.id)
    const transaction = transactions.find((ta) => ta.is_return)

    if (!transaction) {
      return Promise.reject("transaction for return label not found")
    }

    return this.fetch(transaction.object_id).then(({ label_url }) => ({
      ...transaction,
      label_url,
    }))
  }

  /**
   * Check if transaction is return label
   * @param {string} transactionId - shippo transaction id
   * @return {bool}
   */
  async isReturn(transactionId) {
    const transaction = await this.fetch(transactionId)
    return this.fetchExtended(transaction.object_id).then(
      (response) => response?.is_return
    )
  }

  static #parseOrderDisplayId(transaction) {
    const displayId = transaction.metadata
    return displayId.replace(/[^0-9]/g, "")
  }

  async #retrieveOrderByDisplayId(id) {
    return this.#orderService
      .list(
        { display_id: id },
        {
          relations: [
            "fulfillments",
            "fulfillments.tracking_links",
            "shipping_methods",
            "claims",
            "claims.fulfillments",
            "claims.fulfillments.tracking_links",
            "swaps",
            "swaps.fulfillments",
            "swaps.fulfillments.tracking_links",
          ],
        }
      )
      .then((item) => !!item?.length && item[0])
  }
}

export default ShippoTransactionService
