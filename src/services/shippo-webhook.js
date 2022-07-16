import { BaseService } from "medusa-interfaces"
import path from "path"
import { getConfigFile } from "medusa-core-utils"

class ShippoWebhookService extends BaseService {
  #eventBusService
  #orderService
  #shippo
  #shippoTransactionService

  constructor(
    {
      eventBusService,
      orderService,
      shippoClientService,
      shippoTransactionService,
    },
    options
  ) {
    super()

    this.#setConfig(options)

    /** @private @const {EventBusService} */
    this.#eventBusService = eventBusService

    /** @private @const {OrderService} */
    this.#orderService = orderService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransactionService = shippoTransactionService
  }

  async verifyHookSecret(token) {
    return this.options_.webhook_secret
      ? this.options_.webhook_secret === token
      : false
  }

  async handleTransactionUpdated(transaction) {
    const order = await this.#shippoTransactionService.findOrder(transaction)

    const fulfillment = await this.#shippoTransactionService.findFulfillment(
      transaction
    )

    const expandedTransaction =
      await this.#shippoTransactionService.fetchExtended(transaction)

    const { label_url } = transaction

    this.#eventBusService.emit("shippo.transaction_updated.payload", {
      order_id: order.id,
      fulfillment_id: fulfillment.id,
      transaction: {
        ...expandedTransaction,
        label_url,
      },
    })
  }

  async handleTransactionCreated(transaction) {
    const order = await this.#shippoTransactionService.findOrder(transaction)

    const fulfillment = await this.#shippoTransactionService.findFulfillment(
      transaction
    )
    // console.log('*********fulfillment: ', JSON.stringify(fulfillment, null, 2))

    const expandedTransaction =
      await this.#shippoTransactionService.fetchExtended(transaction)

    if (!fulfillment.shipped_at) {
      await this.#orderService
        .createShipment(order.id, fulfillment.id, [
          {
            tracking_number: expandedTransaction.tracking_number,
            url: expandedTransaction.tracking_url_provider,
          },
        ])
        .then((order) => {
          const { label_url } = transaction
          this.#eventBusService.emit("shippo.transaction_created.shipment", {
            order_id: order.id,
            fulfillment_id: fulfillment.id,
            transaction: {
              ...expandedTransaction,
              label_url,
            },
          })
        })
    }

    if (expandedTransaction?.is_return) {
      this.#eventBusService.emit("shippo.transaction_created.return_label", {
        order_id: order.id,
        transaction: expandedTransaction,
      })
    }
  }

  async handleTransactionUpdated(transaction) {}

  #setConfig(options) {
    if (Object.keys(options).length === 0) {
      const {
        configModule: { projectConfig },
      } = getConfigFile(path.resolve("."), "medusa-config")
      this.options_ = projectConfig
    } else {
      this.options_ = options
    }
  }
}

export default ShippoWebhookService
