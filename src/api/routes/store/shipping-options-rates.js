export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")

  const customShippingOptions =
    await shippoFulfillmentService.updateShippingRates(cart_id)

  res.json({ customShippingOptions })
}
