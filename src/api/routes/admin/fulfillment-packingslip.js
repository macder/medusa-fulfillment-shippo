export default async (req, res) => {
  const shippoClientService = req.scope.resolve("shippoClientService")
  const { fulfillment_id } = req.params

  const packingSlip = await shippoClientService.fetchPackingSlip(fulfillment_id)

  res.json(packingSlip)
}
