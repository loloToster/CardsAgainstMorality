import passport from "passport"
import db from "./db"

import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as DiscordStrategy } from "passport-discord"
import { Strategy as FacebookStrategy } from "passport-facebook"

export default () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET
  } = process.env

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !DISCORD_CLIENT_ID ||
    !DISCORD_CLIENT_SECRET ||
    !FACEBOOK_CLIENT_ID ||
    !FACEBOOK_CLIENT_SECRET
  )
    throw new Error("Missing auth env var")

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    if (typeof id !== "number") return done(new Error("Invalid id"))

    const user = await db.user.findUnique({ where: { id } })
    done(null, user)
  })

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
      },
      async (at, rt, profile, done) => {
        const strategyId = `ggl-${profile.id}`

        let user = await db.user.findUnique({ where: { strategyId } })

        if (!user) {
          user = await db.user.create({
            data: {
              name: profile.displayName,
              strategyId,
              picture: profile._json.picture
            }
          })
        }

        done(null, user)
      }
    )
  )

  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: "/auth/discord/callback",
        scope: ["identify", "email"]
      },
      async (at, rt, profile, done) => {
        const strategyId = `dsc-${profile.id}`

        let user = await db.user.findUnique({ where: { strategyId } })

        if (!user) {
          user = await db.user.create({
            data: {
              name: profile.username,
              strategyId,
              picture: profile.avatar
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                : undefined
            }
          })
        }

        done(null, user)
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: "/auth/facebook/callback"
      },
      () => null // todo: implement
    )
  )
}
