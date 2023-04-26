import { RequestHandler, Router } from "express"
import passport from "passport"

const router = Router()

router.get("/me", (req, res) => {
  req.user ? res.send(req.user) : res.status(404).send()
})

router.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

const returnToMiddleware: RequestHandler = (req, res, next) => {
  if (req.session) {
    req.session.returnTo = req.query.returnTo?.toString() ?? null
  }

  next()
}

router.get(
  "/anonymous",
  returnToMiddleware,
  passport.authenticate("custom", { successReturnToOrRedirect: "/" })
)

router.get("/google", returnToMiddleware, passport.authenticate("google"))

router.get(
  "/google/callback",
  passport.authenticate("google", {
    prompt: "select_account",
    successReturnToOrRedirect: "/"
  })
)

router.get("/discord", returnToMiddleware, passport.authenticate("discord"))

router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    prompt: "consent",
    successReturnToOrRedirect: "/"
  })
)

router.get("/facebook", returnToMiddleware, passport.authenticate("facebook"))

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successReturnToOrRedirect: "/"
  })
)

export = router
