import { Router } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { getConfigFile } from "medusa-core-utils"
import authenticate from "@medusajs/medusa/dist/api/middlewares/authenticate"
import middlewares from "../../middlewares"

const route = Router()

export default (app, rootDirectory) => {
  const { configModule } = getConfigFile(rootDirectory, "medusa-config")
  const config = (configModule && configModule.projectConfig) || {}

  const adminCors = config.admin_cors || ""

  route.use(
    cors({
      origin: adminCors.split(","),
      credentials: true,
    })
  )

  app.use("/admin", route)

  route.use(bodyParser.json())

  route.get(
    "/fulfillments/:fulfillment_id/shippo/order",
    authenticate(),
    middlewares.wrap(require("./fulfillment-order").default)
  )

  route.get(
    "/fulfillments/:fulfillment_id/shippo/packingslip",
    authenticate(),
    middlewares.wrap(require("./fulfillment-packingslip").default)
  )

  route.get(
    "/orders/:order_id/shippo/binpack",
    authenticate(),
    middlewares.wrap(require("./orders-binpack").default)
  )

  // all your errors are belong to this
  route.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.status(418).json(err)
    }
  })

  return app
}
