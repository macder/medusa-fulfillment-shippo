import { Router } from "express"
import hooks from "./routes/hooks"

export default (rootDirectory, pluginOptions) => {
  const app = Router()
  hooks(app, rootDirectory, pluginOptions)
  return app
}
