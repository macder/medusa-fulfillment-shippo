import { asFunction } from "awilix"
import glob from "glob"
import path from "path"

export default async (container, options) => {
  const helpersPath = "../helpers/*.js"
  const helpersFull = path.join(__dirname, helpersPath)
  const helpers = glob.sync(helpersFull, { cwd: __dirname })

  helpers.map((fn) => {
    const loaded = require(fn).default

    // loaded(container.cradle)

    container.register({
      shippoHelper: asFunction(
        async (cradle) => await loaded(cradle)
      ).singleton(),
    })
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
