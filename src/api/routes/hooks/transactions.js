export default async (req, res, next) => {
  const shippoClientService = req.scope.resolve("shippoClientService")
  const shippoWebhookService = req.scope.resolve("shippoWebhookService")

  const validToken = await shippoWebhookService.verifyHookSecret(
    req.query.token
  )

  const invalidRequest = () => {
    res.status(500).json()
    return next()
  }

  if (validToken) {
    const untrustedData = req.body.data

    if (untrustedData.object_state === "VALID" && untrustedData.status === "SUCCESS") {
      // Verify received input is a real shippo transaction object by fetching it from shippo api.
      // Then, if it exist, use it as the trusted data going forward instead of the input (req.body)... 
      // Otherwise respond with a 500 and go back to sleep...
      const transaction = await shippoClientService
        .fetchTransaction(untrustedData.object_id)
        .catch((e) => console.error(e))

      if (transaction?.object_state === "VALID") {
        const eventBus = req.scope.resolve("eventBusService")
        eventBus.emit("shippo.transaction_created", {
          transaction, // the trusted data
        })

        res.json("ok")
      }
    }
  }

  return invalidRequest()
}
