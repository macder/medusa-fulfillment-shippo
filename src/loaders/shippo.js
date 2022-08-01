export default async (container) => {
  const shippoFulfillmentService = container.resolve("shippoFulfillmentService")
  const shippingProfileService = container.resolve("shippingProfileService")
  const shippoRatesService = container.resolve("shippoRatesService")
  const logger = container.resolve("logger")
  const manager = container.resolve("manager")
  const config = shippoFulfillmentService.getWebhookConfig()

  if (config.webhook_test_mode) {
    logger.warn(
      "medusa-fulfillment-shippo - Webhook test mode enabled: Accepting untrusted input from req.body"
    )
  }

  const cloned = await shippingProfileService.withTransaction(manager)
  shippingProfileService.fetchCartOptions = async (cart) =>
    cloned
      .fetchCartOptions(cart)
      .then(async (shippingOptions) =>
        shippoRatesService.decorateOptions(cart.id, shippingOptions)
      )
}
