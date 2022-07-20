class ShippoSubscriber {
  #eventBusService
  #orderService
  #shippoTransactionService

  constructor({ eventBusService, orderService, shippoTransactionService }) {
    /** @private @const {EventBusService} */
    this.#eventBusService = eventBusService

    /** @private @const {OrderService} */
    this.#orderService = orderService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransactionService = shippoTransactionService

    this.#eventBusService.subscribe(
      "shippo.accepted.transaction_created",
      this.handleTransactionCreated
    )

    this.#eventBusService.subscribe(
      "shippo.accepted.transaction_updated",
      this.handleTransactionUpdated
    )

    this.#eventBusService.subscribe(
      "shippo.accepted.track_updated",
      this.handleTrackUpdated
    )
  }

  handleTrackUpdated = async (data) => {
    // this.#eventBusService.emit("shippo.track_updated", {})
  }

  handleTransactionCreated = async ({ transaction }) => {
    const order = await this.#shippoTransactionService.findOrder(transaction.object_id)
    const fulfillment = await this.#shippoTransactionService.findFulfillment(
      transaction.object_id
    )

    const expandedTransaction =
      await this.#shippoTransactionService.pollExtended(transaction.object_id)

    if (!fulfillment.shipped_at && !expandedTransaction?.is_return) {
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

  handleTransactionUpdated = async ({ transaction }) => {
    const order = await this.#shippoTransactionService.findOrder(transaction.object_id)

    const fulfillment = await this.#shippoTransactionService.findFulfillment(
      transaction.object_id
    )

    const expandedTransaction =
      await this.#shippoTransactionService.fetchExtended(transaction.object_id)

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
}

export default ShippoSubscriber
