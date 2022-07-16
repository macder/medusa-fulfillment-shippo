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
   * @return {object} The transaction
   */
  async fetch(id) {
    return await this.#client.transaction.retrieve(id)
  }

  /**
   * Fetch the extended version of a transaction
   * @param {string|object} transaction - shippo transaction id or object
   * @return {object} The extended transaction
   */
  async fetchExtended(transaction) {
    const order = await this.findOrder(transaction)
    const transactions = await this.#shippo.fetchExpandedTransactions(order)

    return transactions.find(
      ({ object_id }) => object_id === this.#transaction.object_id
    )
  }

  /**
   * Finds the fulfillment associated with the transaction
   * @param {string|object} transaction - shippo transaction id or object
   * @return {Fulfillment} The fulfillment related to this transaction
   */
  async findFulfillment(transaction) {
    const order = await this.findOrder(transaction)

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
  async findOrder(transaction) {
    this.#setTransaction(await this.#resolveType(transaction))
    const orderDisplayId = await this.#parseOrderDisplayId()
    return await this.#retrieveOrderByDisplayId(orderDisplayId)
  }

  async #parseOrderDisplayId() {
    const displayId = this.#transaction.metadata
    return displayId.replace(/[^0-9]/g, "")
  }

  async #resolveType(transaction) {
    return transaction.object_id
      ? transaction
      : await this.#client.transaction.retrieve(transaction)
  }

  async #retrieveOrderByDisplayId(id) {
    return await this.#orderService
      .list(
        { display_id: id },
        { relations: ["fulfillments", "shipping_methods"] }
      )
      .then((item) => item[0])
  }

  #setTransaction(transaction) {
    this.#transaction = transaction
  }
}

export default ShippoTransactionService
