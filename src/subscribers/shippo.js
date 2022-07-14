class ShippoSubscriber {
  constructor({ eventBusService, shippoWebhookService }) {
    this.shippoWebhookService_ = shippoWebhookService

    eventBusService.subscribe(
      "shippo.accepted.transaction_created",
      this.handleTransaction
    )

    eventBusService.subscribe("shippo.claim_replace_created", this.handleReturn)
  }

  handleTransaction = async ({ transaction }) => {
    return this.shippoWebhookService_.handleTransactionCreated(transaction)
  }

  handleReturn = async (data) => {
    console.log("=============data: ", JSON.stringify(data, null, 2))
  }
}

export default ShippoSubscriber
