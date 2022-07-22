import { BaseService } from "medusa-interfaces"

class ShippoTransactionService extends BaseService {
  #client

  #orderService

  #shippo

  #transaction

  constructor({ orderService, shippoClientService }, options) {
    super()

    /** @private @const {OrderService} */
    this.#orderService = orderService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {Shippo} */
    this.#client = this.#shippo.useClient
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
   * Fetch all transactions related to an {Order}
   * Shorthand for client.transaction.retrieve(id)
   * @param {string} orderId - order_id
   * @return {Promise.<object[]>} The transaction
   */
  async fetchByOrder(orderId) {
    const order = await this.#orderService.retrieve(orderId, {
      relations: ["fulfillments"],
    })

    // TODO - Break this apart?
    const transactions = await Promise.all(
      // filter fulfillments with shippo order
      order.fulfillments
        .filter((ful) => ful.data?.shippo_order_id)
        // map transactions over fulfillments
        .map(
          async ({ id, data: { shippo_order_id } }) =>
            // fetch the fulfillment's shippo order
            await this.#client.order.retrieve(shippo_order_id).then(
              async ({ transactions }) =>
                await Promise.all(
                  // map the full transactions over shippoOrder.transactions
                  transactions.map(
                    async (ta) =>
                      await this.#client.transaction
                        .retrieve(ta.object_id)
                        // add the fulfillment_id to transaction
                        .then((ta) => ({ fulfillment_id: id, ...ta }))
                  )
                )
            )
        )
    )
    return transactions.flat(1)
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
   * @param {string} orderId -
   * @return {Promise.<object[]>} The extended transaction
   */
  async fetchExtendedByOrder(orderId) {
    const order = await this.#orderService.retrieve(orderId)
    const urlQuery = `?q=${order.display_id}&expand[]=rate&expand[]=parcel`
    return await this.#client.transaction
      .search(urlQuery)
      .then((response) => response.results)
  }

  async pollExtended(transactionId) {
    const poller = this.#shippo.poll
    const fetch = async () => await this.fetchExtended(transactionId)

    const validator = () => (response) =>
      response?.object_state === "VALID" ||
      response?.object_status === "SUCCESS"
    return await poller({
      fn: fetch,
      validate: validator(),
      interval: 3500,
      maxAttempts: 3,
    }).catch((e) => {
      console.log(e)
    })
  }

  /**
   * Finds the fulfillment associated with the transaction
   * @param {string|object} transaction - shippo transaction
   * @return {Fulfillment} The fulfillment related to this transaction
   */
  async findFulfillment(transactionId) {
    const order = await this.findOrder(transactionId)

    return order.fulfillments.find(
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
    const orderDisplayId = await this.#parseOrderDisplayId(transaction)
    return await this.#retrieveOrderByDisplayId(orderDisplayId)
  }

  /**
   * @experimental - since 0.19.0
   * @propsed - for 0.20.0 or later
   * @param {Order} order
   * @return {}
   */
  async fetchReturnByOrder(order) {
    const transactions = await this.#shippo.fetchExtendedTransactions(order)
    const transaction = transactions.find((ta) => ta.is_return)

    if (!transaction) {
      return Promise.reject("transaction for return label not found")
    }

    return await this.fetch(transaction.object_id).then(({ label_url }) => ({
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
    return await this.fetchExtended(transaction.object_id).then(
      (response) => response.is_return
    )
  }

  async #parseOrderDisplayId(transaction) {
    const displayId = transaction.metadata
    return displayId.replace(/[^0-9]/g, "")
  }

  async #retrieveOrderByDisplayId(id) {
    return await this.#orderService
      .list(
        { display_id: id },
        { relations: ["fulfillments", "shipping_methods"] }
      )
      .then((item) => !!item?.length && item[0])
  }
}

export default ShippoTransactionService
