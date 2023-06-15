import type { RequestHandler } from "express"
import { StrategyIdentifier } from "../consts"

export const nonAnonymous: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).send()
  if (req.user.strategyId.startsWith(StrategyIdentifier.Anonymous))
    return res.status(403).send()

  next()
}
