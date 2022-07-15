export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const shippoClientService = req.scope.resolve("shippoClientService")
  const { fulfillment_id } = req.params

  console.warn("medusa-fulfillment-shippo: endpoint /admin/fulfillments/:id/shippo/order is deprecated since v0.17.0")
  console.warn("medusa-fulfillment-shippo: endpoint /admin/fulfillments/:id/shippo/order will be removed v0.20.0")

  const order = await shippoClientService.fetchOrder(fulfillment_id)

  res.json(order)
}
