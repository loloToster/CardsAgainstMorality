import dotenv from "dotenv"
import express from "express"
import { createServer as createHttpServer } from "http"
import { Server as SocketIoServer } from "socket.io"
import cookieSession from "cookie-session"
import passport from "passport"

import configurePassport from "./modules/passport"
import { syncedCards } from "./modules/db"
import setupSocketIo from "./modules/io"

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

const io = new SocketIoServer(server, { cors: { origin: "*" } })
setupSocketIo(io)

configurePassport()

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["process.env.COOKIE_SECRET"] // todo: move to env var
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

loadRoutes(app, __dirname + "/routes")

app.use(express.static(__dirname + "/../../client/dist"))

syncedCards.then(() => {
  server.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
  })
})
