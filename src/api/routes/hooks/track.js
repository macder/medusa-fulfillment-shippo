export default async (req, res, next) => {
  const shippoClientService = req.scope.resolve("shippoClientService")
  const shippoTransactionService = req.scope.resolve("shippoTransactionService")
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")
  const eventBus = req.scope.resolve("eventBusService")

  const validToken = await shippoFulfillmentService.verifyHookSecret(
    req.query.token
  )
  const event = req.headers["x-shippo-event"]

  const isTest = true // TODO - Add to medusa-config.js

  const invalidRequest = () => {
    eventBus.emit(`shippo.rejected.${event}`, {})
    res.status(500).json()
    return next()
  }

  if (validToken) {
    const untrustedData = req.body.data

    if (isTest) {
      eventBus.emit(`shippo.accepted.${event}`, { untrustedData })
    }

    if (!isTest) {
      const transaction = await shippoTransactionService.fetch(
        untrustedData.transaction
      )

      if (
        transaction?.object_state === "VALID" &&
        transaction?.tracking_number === untrustedData.tracking_number
      ) {
        // fetch the track object from shippo and...
      }
    }

    res.json({})
    return next()
  }

  return invalidRequest()
}
