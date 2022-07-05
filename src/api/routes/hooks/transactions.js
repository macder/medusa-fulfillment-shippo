export default async (req, res, next) => {
  const shippoClientService = req.scope.resolve("shippoClientService")

  const validToken = await shippoClientService.verifyHookSecret(req.query.token)

  const invalidRequest = () => {
    res.status(500).json()
    return next()
  }

  if (validToken) {
    const { data } = req.body

    if (data.object_state === "VALID" && data.status === "SUCCESS") {
      // verify the input shippo transaction exists by fetching it from shippo api
      // and then use the trusted data going forward instead of the input (req.body)...
      const transaction = await shippoClientService
        .fetchTransaction(data.object_id)
        .catch((e) => console.error(e))

      if (transaction?.object_state === "VALID") {
        const eventBus = req.scope.resolve("eventBusService")
        const eventType = req.body.event
        eventBus.emit(`shippo.${eventType}`, {
          transaction, // the trusted data
        })

        res.json("ok")
      }
    }
  }

  return invalidRequest()
}
