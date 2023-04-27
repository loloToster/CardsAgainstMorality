import dotenv from "dotenv"
import express, { ErrorRequestHandler } from "express"
import "express-async-errors"
import { createServer as createHttpServer } from "http"
import { Server as SocketIoServer } from "socket.io"
import cookieSession from "cookie-session"
import passport from "passport"

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

dotenv.config()

const app = express()
const server = createHttpServer(app)
const port = 3000

const sessionMw = cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ["process.env.COOKIE_SECRET"] // todo: move to env var
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

app.use(express.static(__dirname + "/../../client/dist"))

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
