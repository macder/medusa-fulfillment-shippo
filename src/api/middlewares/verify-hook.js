export default () => {
  return async (req, res, next) => {
    const eventBus = req.scope.resolve("eventBusService")
    const shippoFulfillment = req.scope.resolve("shippoFulfillmentService")
    const shippoTrackService = req.scope.resolve("shippoTrackService")
    const shippoTransactionService = req.scope.resolve(
      "shippoTransactionService"
    )
    const config = shippoFulfillment.getWebhookConfig()
    const event = req.headers["x-shippo-event"]
    const token = req.query.token
    const untrustedData = req.body.data

    if (config.webhook_test_mode) {
      req.body = untrustedData
      return next()
    }

    const invalidRequest = () => {
      eventBus.emit(`shippo.rejected.${event}`, {})
      return next("500")
    }

    const isTokenValid = () =>
      config.webhook_secret ? config.webhook_secret === token : false

    if (!config.webhook_secret || !isTokenValid()) {
      invalidRequest()
    }

    const fetchTransactionFromShippo = async () => {
      const transactionId =
        event === "track_update"
          ? untrustedData?.transaction
          : untrustedData?.object_id

      return await shippoTransactionService
        .fetch(transactionId)
        .catch((e) => invalidRequest())
    }

    const transaction = await fetchTransactionFromShippo()

    if (
      transaction?.object_state !== "VALID" ||
      transaction?.status !== "SUCCESS"
    ) {
      invalidRequest()
    }

    if (
      event === "track_updated" &&
      transaction?.tracking_number === untrustedData?.tracking_number
    ) {
      const trackingStatus = await shippoTrackService.fetch(
        untrustedData.carrier,
        untrustedData.tracking_number
      )

      req.body = trackingStatus
      return next()
    } else {
      req.body = transaction
      return next()
    }
  }
}
