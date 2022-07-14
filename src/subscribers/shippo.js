class ShippoSubscriber {
  constructor({ eventBusService, shippoWebhookService }) {
    this.shippoWebhookService_ = shippoWebhookService

    eventBusService.subscribe(
      "shippo.accepted.transaction_created",
      this.handleTransaction
    )
  }

  handleTransaction = async ({ transaction }) => {
    return this.shippoWebhookService_.handleTransactionCreated(transaction)
  }
}

export default ShippoSubscriber
