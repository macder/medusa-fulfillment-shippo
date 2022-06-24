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
            .retrieve(shippo_order_id)
            .then((response) =>
              Object.assign(response, {
                to_address: response.to_address.object_id,
                from_address: response.from_address?.object_id ?? null,
                object_owner: "secret",
              })
            )
      )
      .then((response) => ({ response }))
  )
}
