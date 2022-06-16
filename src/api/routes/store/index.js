import { Router } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import middlewares from "../../middlewares"
import { getConfigFile } from "medusa-core-utils"

const route = Router()

export default (app, rootDirectory) => {
  const { configModule } = getConfigFile(rootDirectory, `medusa-config`)
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
    "/shippo/live-rates/:cart_id",
    middlewares.wrap(require("./live-rates").default)
  )
  route.post(
    "/shippo/live-rates",
    bodyParser.json(),
    middlewares.wrap(require("./live-rates-post").default)
  )

  return app
}
