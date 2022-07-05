import { Router } from "express"
import admin from "./routes/admin"
import store from "./routes/store"
import hooks from "./routes/hooks"

export default (rootDirectory) => {
  const app = Router()

  store(app, rootDirectory)
  admin(app, rootDirectory)
  hooks(app, rootDirectory)

  return app
}
