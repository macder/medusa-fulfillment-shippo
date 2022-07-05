import { Router } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { getConfigFile } from "medusa-core-utils"
import normalizeQuery from "@medusajs/medusa/dist/api/middlewares/normalized-query"
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

  app.use("/hooks", route)
  route.use(bodyParser.json())

  route.post(
    "/shippo/transaction",
    bodyParser.json(),
    middlewares.wrap(require("./transactions").default)
  )

  return app
}
