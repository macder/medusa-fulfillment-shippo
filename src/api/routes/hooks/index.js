import { Router } from "express"
import rateLimit from "express-rate-limit"
import bodyParser from "body-parser"
import cors from "cors"
import { getConfigFile } from "medusa-core-utils"
import middlewares from "../../middlewares"

const route = Router()

export default (app, rootDirectory) => {
  const { configModule } = getConfigFile(rootDirectory, "medusa-config")
  const config = (configModule && configModule.projectConfig) || {}

  const storeCors = config.store_cors || ""

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })

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
    apiLimiter,
    middlewares.wrap(require("./transactions").default)
  )

  return app
}
