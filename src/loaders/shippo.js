export default async (container) => {
  const logger = container.resolve("logger")
  const config = shippoFulfillmentService.getWebhookConfig()

  if (config.webhook_test_mode) {
    logger.warn(
      "medusa-fulfillment-shippo - Webhook test mode enabled: Accepting untrusted input from req.body"
    )
  }
}
