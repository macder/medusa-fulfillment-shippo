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
    "/shippo/order/:fulfillment_id",
    authenticate(),
    middlewares.wrap(require("./shippo-order").default)
  )

  route.get(
    "/shippo/order/:fulfillment_id/packingslip",
    authenticate(),
    middlewares.wrap(require("./order-packingslip").default)
  )

  // all your errors are belong to this
  route.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.status(418).json(err)
    }
  })

  return app
}
