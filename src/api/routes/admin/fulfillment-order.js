export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const shippoClientService = req.scope.resolve("shippoClientService")
  const { fulfillment_id } = req.params

  const order = await shippoClientService.fetchOrder(fulfillment_id)

  res.json(order)
}
