export default async (container, options) => {
  const shippingProfileService = container.resolve("shippingProfileService")
  const shippoRatesService = container.resolve("shippoRatesService")
  const manager = container.resolve("manager")

  const cloned = await shippingProfileService.withTransaction(manager)

  shippingProfileService.fetchCartOptions = async (cart) =>
    await cloned
      .fetchCartOptions(cart)
      .then(
        async (shippingOptions) =>
          await shippoRatesService.decorateOptions(cart.id, shippingOptions)
      )
}