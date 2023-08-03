import express from "express"
import db from "../../modules/db"
import { nonAnonymousMiddleware } from "../../middleware/non-anonymous"
import { validateDto } from "../../utils"
import { UpdateUserDto } from "../../dtos/api/update-user.dto"

const router = express.Router()

router.use(nonAnonymousMiddleware)

router.patch("/", async (req, res) => {
  const userModifications = await validateDto(UpdateUserDto, req.body)

  await db.user.update({
    where: { id: req.user?.id },
    // todo: username
    data: { name: userModifications.displayName }
  })

  res.send()
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
