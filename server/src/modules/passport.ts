import passport from "passport"
import { v4 as uuid } from "uuid"

import db from "./db"
import { User } from "@prisma/client"

import { Strategy as AnonymousStrategy } from "passport-custom"
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

  passport.deserializeUser<User["id"]>(async (id, done) => {
    const user = await db.user.findUnique({ where: { id } })
    done(null, user)
  })

  passport.use(
    new AnonymousStrategy(async (req, done) => {
      const strategyId = `ans-${uuid()}`

      const user = await db.user.create({
        data: { name: "Anonymous", strategyId }
      })

      done(null, user)
    })
  )

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
