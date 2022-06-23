export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")
  const { fulfillment_id } = req.params

  const shippoPackingSlip = await fulfillmentService
    .retrieve(fulfillment_id)
    .then(
      async (fulfillment) =>
        await shippoFulfillmentService.fetchPackingSlip(
          fulfillment.data.shippo_order_id
        )
    )

  res.json({ shippoPackingSlip })
}
