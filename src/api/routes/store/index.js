import { Router } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { getConfigFile } from "medusa-core-utils"
import middlewares from "../../middlewares"

const route = Router()

export default (app, rootDirectory) => {
  const { configModule } = getConfigFile(rootDirectory, "medusa-config")
  const config = (configModule && configModule.projectConfig) || {}

  const storeCors = config.store_cors || ""

  route.use(
    cors({
      origin: storeCors.split(","),
      credentials: true,
    })
  )

  app.use("/store", route)

  route.get(
    "/carts/:cart_id/shippo/rates",
    bodyParser.json(),
    middlewares.wrap(require("./carts-rates").default)
  )

  route.post(
    "/shipping-options/:cart_id/shippo/rates/",
    bodyParser.json(),
    middlewares.wrap(require("./shipping-options-rates").default)
  )

  // route.get(
  //   "/shipping-options/:cart_id",
  //   bodyParser.json(),
  //   middlewares.wrap(require("./shipping-options").default)
  // )

  // all your errors are belong to this
  route.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.status(418).json(err)
    }
  })

  return app
}
