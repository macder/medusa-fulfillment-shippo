export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoRatesService = req.scope.resolve("shippoRatesService")

  const shippingOptions = await shippoRatesService.fetchCartOptions(cart_id)

  res.json({ shipping_options: shippingOptions })
}
