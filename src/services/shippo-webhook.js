import { BaseService } from "medusa-interfaces"
import path from "path"
import { getConfigFile } from "medusa-core-utils"

class ShippoWebhookService extends BaseService {
  constructor(
    { fulfillmentService, orderService, shippoClientService },
    options
  ) {
    super()

    this.setConfig_(options)

    /** @private @const {OrderService} */
    this.fulfillmentService_ = fulfillmentService

    /** @private @const {OrderService} */
    this.orderService_ = orderService

    /** @private @const {ShippoClientService} */
    this.shippo_ = shippoClientService
  }

  async verifyHookSecret(token) {
    return this.options_.webhook_secret
      ? this.options_.webhook_secret === token
      : false
  }

  async handleTransactionCreated(transaction) {
    const orderDisplayId = await this.parseOrderDisplayId_(transaction.metadata)
    const order = await this.retrieveOrderByDisplayId_(orderDisplayId)
    const fulfillment = await this.findFulfillmentForTransaction_(
      transaction,
      order
    )

    const expandedTransaction = await this.retrieveExpandedTransaction_(
      transaction.object_id,
      orderDisplayId
    )

    // check if this fulfillment is already shipped
    if (
      fulfillment.metadata?.transaction_id !== transaction.object_id &&
      !expandedTransaction.is_return
    ) {
      const shipment = await this.fulfillmentService_.createShipment(
        fulfillment.id,
        [
          {
            tracking_number: expandedTransaction.tracking_number,
            url: expandedTransaction.tracking_url_provider,
          },
        ],
        {
          metadata: {
            transaction_id: expandedTransaction.object_id,
            rate: {
              final: expandedTransaction.rate,
              estimated: {},
            },
            label_url: transaction.label_url,
          },
        }
      )
    }

    if (expandedTransaction.is_return) {
      // Pay when scanned return label
      // Some carriers provide this with outgoing label
      // Need to decide what to do here...
      // i.e. best place for this data
      // Doesnt really belong to this particular fulfillment
    }
  }

  async findFulfillmentForTransaction_(transaction, order) {
    return order.fulfillments.find(
      ({ data: { shippo_order_id } }) => shippo_order_id === transaction.order
    )
  }

  async parseOrderDisplayId_(string) {
    return string.replace(/[^0-9]/g, "")
  }

  async retrieveExpandedTransaction_(id, orderDisplayId) {
    const transaction = await this.shippo_.fetchOrderTransactions(
      orderDisplayId
    )
    return transaction.find(({ object_id }) => object_id === id)
  }

  async retrieveOrderByDisplayId_(id) {
    return await this.orderService_
      .list({ display_id: id }, { relations: ["fulfillments"] })
      .then((item) => item[0])
  }

  setConfig_(options) {
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
