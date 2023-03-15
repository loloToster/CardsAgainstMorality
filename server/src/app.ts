import express from "express"
import db, { syncedCards } from "./modules/db"

const app = express()
const port = 3000

app.get("/", (req, res) => {
  res.send("Hello World!")
})

syncedCards.then(() => {
  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
  })
})
