export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")

  res.json(
    await shippoFulfillmentService
      .fetchLiveRates(cart_id)
      .then((response) => response)
  )
}
