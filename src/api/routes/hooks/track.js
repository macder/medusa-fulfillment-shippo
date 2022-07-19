export default async (req, res, next) => {
  const eventBus = req.scope.resolve("eventBusService")

  const event = req.headers["x-shippo-event"]
  eventBus.emit(`shippo.accepted.${event}`, {
    trackingStatus,
  })

  res.json({})
  return next()
}
