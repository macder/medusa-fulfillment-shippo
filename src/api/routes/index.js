
import { Router } from "express"
import bodyParser from "body-parser"
import middlewares from "../middlewares"

const route = Router()

export default (app) => {
  app.use("/shippo", route)

  route.use(bodyParser.json())
  
  route.get(
    "/live-rates/:cart_id", 
    middlewares.wrap(require("./live-rates").default)
  )
  route.post(
    "/live-rates",
    bodyParser.raw({ type: "application/json" }),
    middlewares.wrap(require("./live-rates-post").default)
  )

  return app
}
