export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")
  const rates = await shippoFulfillmentService.fetchLiveRates(cart_id)

  const customShippingOptions =
    await shippoFulfillmentService.createCustomShippingOptions(cart_id, rates)

  res.json({ customShippingOptions })
}
