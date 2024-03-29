import passport from "passport"

import { verify as captcha } from "hcaptcha"
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
  Config as UniqueNamesConfig
} from "unique-names-generator"

import db from "./db"
import { User } from "@prisma/client"

import { Strategy as AnonymousStrategy } from "passport-custom"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as DiscordStrategy } from "passport-discord"
import { Strategy as FacebookStrategy } from "passport-facebook"

import { StrategyIdentifier } from "../consts"

const uniqueNamesConfig: UniqueNamesConfig = {
  dictionaries: [
    adjectives,
    animals,
    [...Array(10000).keys()].map(n => ("0000" + n).slice(-4))
  ],
  separator: "",
  style: "capital"
}

export default () => {
  const {
    HCAPTCHA_SECRET,
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
      const token = req.query.token?.toString()

      if (HCAPTCHA_SECRET) {
        if (!token) {
          done(new Error("No captcha token"), null)
          return
        }

        const { success } = await captcha(HCAPTCHA_SECRET, token)

        if (!success) {
          done(new Error("Invalid captcha token"), null)
          return
        }
      }

      const strategyId = StrategyIdentifier.Anonymous

      const displayName = uniqueNamesGenerator(uniqueNamesConfig)

      const user = await db.user.create({
        data: { displayName, strategyId, lastUsed: new Date() }
      })

      done(null, user)
    })
  )

  async function handleStrategy(
    strategyPrefix: StrategyIdentifier,
    id: string,
    displayName: string,
    picture: string | undefined | null,
    done: (err?: Error | null, user?: Express.User) => void
  ) {
    const strategyId = `${strategyPrefix}-${id}`

    let user = await db.user.findFirst({ where: { strategyId } })

    if (user) {
      // todo: update picture only if user wants to
      await db.user.update({
        where: { id: user.id },
        data: { picture }
      })
    } else {
      user = await db.user.create({
        data: {
          displayName,
          strategyId,
          picture
        }
      })
    }

    done(null, user)
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
      },
      async (at, rt, profile, done) => {
        await handleStrategy(
          StrategyIdentifier.Google,
          profile.id,
          profile.displayName,
          profile._json.picture,
          done
        )
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
        await handleStrategy(
          StrategyIdentifier.Discord,
          profile.id,
          profile.username,
          `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
          done
        )
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "displayName", "picture.type(large)"]
      },
      async (at, rt, profile, done) => {
        await handleStrategy(
          StrategyIdentifier.Facebook,
          profile.id,
          profile.displayName,
          profile.photos?.at(0)?.value,
          done
        )
      }
    )
  )
}
