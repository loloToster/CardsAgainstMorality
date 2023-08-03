import express from "express"
import { Prisma } from "@prisma/client"
import db from "../../modules/db"
import { nonAnonymousMiddleware } from "../../middleware/non-anonymous"
import { validateDto } from "../../utils"
import { UpdateUserDto } from "../../dtos/api/update-user.dto"

const router = express.Router()

router.use(nonAnonymousMiddleware)

router.patch("/", async (req, res) => {
  let { username, displayName } = await validateDto(UpdateUserDto, req.body)

  displayName = displayName || username
  username = username.toLowerCase()

  try {
    await db.user.update({
      where: { id: req.user?.id },
      data: { username, displayName }
    })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).send()
    }

    throw err
  }

  res.json({ username, displayName })
})

router.delete("/", async (req, res) => {
  await db.user.delete({ where: { id: req.user?.id } })
  res.send()
})

router.delete("/picture", async (req, res) => {
  await db.user.update({ where: { id: req.user?.id }, data: { picture: null } })
  res.send()
})

export = router
