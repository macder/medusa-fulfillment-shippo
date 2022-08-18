import { asFunction } from "awilix"
import path from "path"

export default async (container, options) => {
  const helperPath = "../helpers/index.js"
  const helperFull = path.join(__dirname, helperPath)

  const loaded = require(helperFull).default
  container.register({
    shippoHelper: asFunction((cradle) => loaded(cradle)).singleton(),
  })

  const shippoFulfillmentService = container.resolve("shippoFulfillmentService")
  const logger = container.resolve("logger")
  const config = shippoFulfillmentService.getWebhookConfig()
  if (config.webhook_test_mode) {
    logger.warn(
      "medusa-fulfillment-shippo - Webhook test mode enabled: Accepting untrusted input from req.body"
    )
  }
}
