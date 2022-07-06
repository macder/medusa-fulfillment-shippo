export default async (req, res, next) => {
  const { cart_id } = req.params

  const shippoRatesService = req.scope.resolve("shippoRatesService")

  const cartService = req.scope.resolve("cartService")

  const pricingService = req.scope.resolve("pricingService")

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

  const shippingOptions = await shippoRatesService.retrieveShippingOptions(cart)
  const data = await pricingService.setShippingOptionPrices(shippingOptions, {
    cart_id,
  })

  res.json({ shipping_options: data })
}
