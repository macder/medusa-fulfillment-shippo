export default async (req, res, next) => {
  const eventBus = req.scope.resolve("eventBusService")

  const event = req.headers["x-shippo-event"]
  const transaction = req.body
  eventBus.emit(`shippo.accepted.${event}`, {
    transaction,
  })

  res.json({})
  return next()
}
