import express from "express"
import passport from "passport"

const router = express.Router()

router.get("/me", (req, res) => {
  req.user ? res.send(req.user) : res.status(404).send()
})

router.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

router.get("/google", passport.authenticate("google"))

router.get(
  "/google/callback",
  passport.authenticate("google", {
    prompt: "select_account",
    successRedirect: "/"
  })
)

router.get("/discord", passport.authenticate("discord"))

router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    prompt: "consent",
    successRedirect: "/"
  })
)

router.get("/facebook", passport.authenticate("facebook"))

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/"
  })
)

export = router
