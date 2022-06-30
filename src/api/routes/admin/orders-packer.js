export default async (req, res) => {
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")
  const { order_id } = req.params

  res.json(await shippoFulfillmentService.retrievePackerResults(order_id))
}
