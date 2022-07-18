import { BaseService } from "medusa-interfaces"

class ShippoTransactionService extends BaseService {
  #client
  #order
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
    const transactions = await this.#shippo.fetchExtendedTransactions(order)

    return transactions.find(
      ({ object_id }) => object_id === this.#transaction.object_id
    )
  }

  async pollExtended(transaction) {
    const poller = this.#shippo.poll
    const fetch = async () => await this.fetchExtended(transaction)

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
   * @param {string|object} transaction - shippo transaction id or object
   * @return {Fulfillment} The fulfillment related to this transaction
   */
  async findFulfillment(transaction) {
    await this.setTransaction(transaction)
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
    await this.setTransaction(transaction)
    const orderDisplayId = await this.#parseOrderDisplayId()

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
   * @param {string|object} transaction - shippo transaction id or object
   * @return {bool}
   */
  async isReturn(transaction) {
  await this.setTransaction(transaction)
   return await this.fetchExtended(transaction)
      .then(response => response.is_return)
  }

  async #parseOrderDisplayId() {
    const displayId = this.#transaction.metadata
    return displayId.replace(/[^0-9]/g, "")
  }

  async #resolveType(transaction) {
    return transaction?.object_id
      ? transaction
      : await this.#client.transaction.retrieve(transaction)

  }

  async #retrieveOrderByDisplayId(id) {
    return await this.#orderService
      .list(
        { display_id: id },
        { relations: ["fulfillments", "shipping_methods"] }
      )
      .then((item) => !!item?.length && item[0])
  }

  getTransaction() {
    return this.#transaction
  }

  async setTransaction(transactionOrId) {
    // Warning, this can make u dizzy... 
    // BUT, it significantly reduces api request rate
    // probably a better way to do this, another day... BARF
    // fully unit tested for refactor safety ;)
    if (!this.#transaction) {
      this.#transaction = await this.#resolveType(transactionOrId)
    } else {
      if (!transactionOrId?.object_id) {
        const ta_id = transactionOrId
        if (ta_id !== this.#transaction.object_id) {
          this.#transaction = await this.fetch(ta_id)
        }
      } else {
        const transaction = transactionOrId
        if (this.#transaction?.object_id !== transaction.object_id) {
          this.#transaction = transaction
        }
        else if (!this.#transaction?.rate?.object_id) {
          if (transaction?.rate?.object_id) {
            this.#transaction = transaction
          }
        }
      }
    }
  }
}

export default ShippoTransactionService
