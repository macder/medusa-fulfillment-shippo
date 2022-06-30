export default async (req, res) => {
  const customShippingOptionService = req.scope.resolve(
    "customShippingOptionService"
  )
  const orderService = req.scope.resolve("orderService")
  const { order_id } = req.params
  const order = await orderService.retrieve(order_id)

  if (order.metadata.shippo.custom_shipping_options) {
    const cso_id = order.metadata.shippo.custom_shipping_options[0]

    res.json(
      await customShippingOptionService
        .retrieve(cso_id)
        .then((cso) => cso.metadata.shippo_binpack)
    )
  } else {
    res.json({ error: "This order has no binpack data available" })
  }
}
