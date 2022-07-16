export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoRatesService = req.scope.resolve("shippoRatesService")
  const rates = await shippoRatesService.fetchCartRates(cart_id)

  console.warn(
    "medusa-fulfillment-shippo: endpoint /store/carts/:id/shippo/rates is deprecated since v0.17.0"
  )
  console.warn(
    "medusa-fulfillment-shippo: endpoint /store/carts/:id/shippo/rates will be removed v0.20.0"
  )

  res.json(rates)
}
