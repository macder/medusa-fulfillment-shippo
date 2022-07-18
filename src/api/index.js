import { Router } from "express"
import hooks from "./routes/hooks"

export default (rootDirectory) => {
  const app = Router()
  hooks(app, rootDirectory)
  return app
}
