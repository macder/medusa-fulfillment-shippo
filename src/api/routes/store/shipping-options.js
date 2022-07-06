export default async (req, res, next) => {
  const { cart_id } = req.params

  const shippoRatesService = req.scope.resolve("shippoRatesService")

  const cartService = req.scope.resolve("cartService")

  const pricingService = req.scope.resolve("pricingService")

  const shippingProfileService = req.scope.resolve("shippingProfileService")

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

  const options = await shippoRatesService.requestRates(cart)

  // const options = await shippingProfileService.fetchCartOptions(cart)
  //   .then(option => option.map(so => ({ ...so, amount: 10000})))

  const data = await pricingService.setShippingOptionPrices(options, {
    cart_id,
  })

  res.json({ shipping_options: data })

  // res.json("Hi!")
}
