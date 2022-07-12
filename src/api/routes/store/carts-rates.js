export default async (req, res, next) => {
  const { cart_id } = req.params
  const shippoRatesService = req.scope.resolve("shippoRatesService")

  const rates = await shippoRatesService.fetchCartRates(cart_id)

  res.json(rates)
}
