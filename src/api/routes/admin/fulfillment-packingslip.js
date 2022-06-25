export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")
  const { fulfillment_id } = req.params

  res.json(
    await fulfillmentService
      .retrieve(fulfillment_id)
      .then(
        async ({ data: { shippo_order_id } }) =>
          await shippoFulfillmentService.useClient.order
            .packingslip(shippo_order_id)
            .then((response) => ({ ...response }))
      )
  )
}
