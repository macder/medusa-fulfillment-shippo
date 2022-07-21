import { BaseService } from "medusa-interfaces"

class ShippoTransactionService extends BaseService {
  #client
  #fetchBy
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
   * @return {object} The transaction
   */
  async fetch(id) {
    if (this.#transaction?.object_id !== id) {
      this.#transaction = await this.#client.transaction.retrieve(id)
    }
    return this.#transaction
  }

  /**
   * Fetch the extended version of a transaction
   * @param {string|object} transaction - shippo transaction id
   * @return {object} The extended transaction
   */
  async fetchExtended(transactionId) {
    const order = await this.findOrder(transactionId)
    const urlQuery = `?q=${order.display_id}&expand[]=rate&expand[]=parcel`
    const transactions = await this.#client.transaction
      .search(urlQuery)
      .then((response) => response.results)

    return transactions.find(({ object_id }) => object_id === transactionId)
  }

  async pollExtended(transactionId) {
    const poller = this.#shippo.poll
    const fetch = async () => await this.fetchExtended(transactionId)

    const validator = () => (response) => {
      return (
        response?.object_state === "VALID" ||
        response?.object_status === "SUCCESS"
      )
    }
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
