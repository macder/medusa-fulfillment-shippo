class ShippoSubscriber {
  constructor({ eventBusService, shippoWebhookService }) {
    this.shippoWebhookService_ = shippoWebhookService

    eventBusService.subscribe(
      "shippo.accepted.transaction_created",
      this.handleTransactionCreated
    )

    eventBusService.subscribe(
      "shippo.accepted.transaction_updated",
      this.handleTransactionUpdated
    )

    eventBusService.subscribe(
      "shippo.transaction_created.shipment",
      this.handleTest
    )
  }

  handleTransactionCreated = async ({ transaction }) => {
    return this.shippoWebhookService_.handleTransactionCreated(transaction)
  }

  handleTransactionUpdated = async ({ transaction }) => {
    return this.shippoWebhookService_.handleTransactionUpdated(transaction)
  }

  handleTest = async (data) => {
    console.log("*********data: ", JSON.stringify(data, null, 2))
  }
}

export default ShippoSubscriber
