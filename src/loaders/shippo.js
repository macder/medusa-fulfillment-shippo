export default async (container, options) => {
  const shippoFulfillmentService = container.resolve("shippoFulfillmentService")
  const shippingProfileService = container.resolve("shippingProfileService")
  const shippoRatesService = container.resolve("shippoRatesService")
  const manager = container.resolve("manager")
  const config = shippoFulfillmentService.getWebhookConfig()
  
  if (config.webhook_test_mode) {
    console.warn(
      "\x1b[33m WARNING: medusa-fulfillment-shippo - Webhook test mode enabled: Bypassing req.body validation\x1b[0m"
    )
  }

  const cloned = await shippingProfileService.withTransaction(manager)

  shippingProfileService.fetchCartOptions = async (cart) =>
    await cloned
      .fetchCartOptions(cart)
      .then(
        async (shippingOptions) =>
          await shippoRatesService.decorateOptions(cart.id, shippingOptions)
      )
}
