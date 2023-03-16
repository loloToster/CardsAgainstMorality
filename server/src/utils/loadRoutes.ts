/* eslint @typescript-eslint/no-var-requires: off */
import fs from "fs"
import path from "path"
import type { Application as ExpressApp } from "express"

export function loadRoutes(app: ExpressApp, dir: string, prefix = "") {
  let fullPath = path.join(dir, "root.js")
  if (fs.existsSync(fullPath)) app.use(`${prefix}/`, require(fullPath))
  fullPath = path.join(dir, "root.ts")
  if (fs.existsSync(fullPath)) app.use(`${prefix}/`, require(fullPath))
  fs.readdirSync(dir).forEach(x => {
    if (x.startsWith("_")) return
    fullPath = path.join(dir, x)
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadRoutes(app, fullPath, `${prefix}/${x}`)
    } else if (x.match(/\.(js|ts)$/)) {
      const name = x.slice(0, -3)
      if (name == "root") return
      app.use(`${prefix}/${name}`, require(fullPath))
    }
  })
}
