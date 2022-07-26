export default async (req, res) => {
  const eventBus = req.scope.resolve("eventBusService")

  const trackingStatus = req.body
  const event = req.headers["x-shippo-event"]
  eventBus.emit(`shippo.accepted.${event}`, {
    trackingStatus,
  })

  res.json({})
}
