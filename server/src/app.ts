import express from "express"
import db, { syncedCards } from "./modules/db"
import { User as PrismaUser } from "@prisma/client"

const app = express()
const port = 3000

/* app.get("/", (req, res) => {
  res.send("Hello World!")
}) */

declare global {
  namespace Express {
    type User = PrismaUser
  }
}

app.use(express.static(__dirname + "/../../client/dist"))

syncedCards.then(() => {
  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
  })
})
