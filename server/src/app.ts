import "reflect-metadata"
import dotenv from "dotenv"
import express, { ErrorRequestHandler } from "express"
import "express-async-errors"
import { createServer as createHttpServer } from "http"
import { Server as SocketIoServer } from "socket.io"
import cookieSession from "cookie-session"
import passport from "passport"
import path from "path"

import configurePassport from "./modules/passport"
import db from "./modules/db"
import logger from "./modules/logger"
import { Rooms } from "./modules/rooms"

import { loadRoutes } from "./utils/loadRoutes"

import type { User as PrismaUser } from "@prisma/client"

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends PrismaUser {}
  }
}

dotenv.config({ path: __dirname + "/../../.env" })

const app = express()
const server = createHttpServer(app)
const port = process.env.PORT || 3000

let { COOKIE_SECRET } = process.env
if (!COOKIE_SECRET) {
  logger.warn("No Cookie Secret")
  COOKIE_SECRET = "secret"
}

app.enable("trust proxy")

const sessionMw = cookieSession({
  maxAge: parseInt(process.env.COOKIE_AGE || "0") || 24 * 60 * 60 * 1000,
  keys: [COOKIE_SECRET]
})

app.use(sessionMw)

configurePassport()
app.use(passport.initialize())
app.use(passport.session())

const io = new SocketIoServer(server, { cors: { origin: "*" } })

io.use((s, next) =>
  sessionMw(
    s.request as express.Request,
    {} as express.Response,
    next as express.NextFunction
  )
)

const rooms = new Rooms(io)
app.set("rooms", rooms)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

loadRoutes(app, __dirname + "/routes")

const staticPath = path.normalize(__dirname + "/../../client/dist")
app.use(express.static(staticPath))

app.use((req, res) => {
  res.sendFile(staticPath + "/index.html")
})

app.use(((err, req, res, next) => {
  logger.error(err?.message ?? err)
  res.status(500).send()
  next()
}) as ErrorRequestHandler)

db.preHttpServerStart().then(() => {
  server.listen(port, async () => {
    logger.info(`Listening on port ${port}`)
  })
})
