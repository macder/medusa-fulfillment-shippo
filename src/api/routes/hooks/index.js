import { Router } from "express"
import rateLimit from "express-rate-limit"
import bodyParser from "body-parser"
import middlewares from "../../middlewares"

const route = Router()

export default (app) => {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.use("/hooks", route)
  route.use(bodyParser.json())

  route.post(
    "/shippo/transaction",
    middlewares.verifyHook(),
    apiLimiter,
    middlewares.wrap(require("./transactions").default)
  )

  route.post(
    "/shippo/track",
    middlewares.verifyHook(),
    apiLimiter,
    middlewares.wrap(require("./track").default)
  )

  return app
}
