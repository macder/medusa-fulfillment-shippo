export default async (req, res) => {
  const shippoClientService = req.scope.resolve("shippoClientService")
  const { fulfillment_id } = req.params

  console.warn("medusa-fulfillment-shippo: endpoint /admin/fulfillments/:id/shippo/packingslip is deprecated since v0.17.0")
  console.warn("medusa-fulfillment-shippo: endpoint /admin/fulfillments/:id/shippo/packingslip will be removed v0.20.0")

  const packingSlip = await shippoClientService.fetchPackingSlip(fulfillment_id)

  res.json(packingSlip)
}
