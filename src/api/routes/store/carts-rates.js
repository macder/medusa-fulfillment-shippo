export default async (req, res, next) => {
  const { cart_id } = req.params
  const cartService = req.scope.resolve("cartService")
  const shippoRatesService = req.scope.resolve("shippoRatesService")

  const cart = await cartService.retrieve(cart_id, {
    relations: [
      "shipping_address",
      "items",
      "items.tax_lines",
      "items.variant",
      "items.variant.product",
      "discounts",
      "region",
    ],
  })

  const rates = await shippoRatesService.retrieveRawRates(cart)

  res.json(rates)
}
