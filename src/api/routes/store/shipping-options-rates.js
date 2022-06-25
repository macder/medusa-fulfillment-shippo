export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")

  res.json(
    await shippoFulfillmentService.updateShippingRates(cart_id)
  )
}
