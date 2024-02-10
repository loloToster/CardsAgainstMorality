import { RequestHandler, Router } from "express"
import passport from "passport"

import { ApiUser } from "../types"
import { StrategyIdentifier } from "../consts"

const router = Router()

router.get("/captchakey", (req, res) => {
  const { VITE_CAPTCHA_SITEKEY } = process.env

  if (VITE_CAPTCHA_SITEKEY) {
    res.json({ key: VITE_CAPTCHA_SITEKEY })
  } else {
    res.status(404).send()
  }
})

router.get("/me", (req, res) => {
  if (!req.user) return res.status(404).send()

  const user: ApiUser = {
    id: req.user.id,
    username: req.user.username,
    displayName: req.user.displayName,
    picture: req.user.picture,
    anonymous: req.user.strategyId.startsWith(StrategyIdentifier.Anonymous)
  }

  res.send(user)
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
