import type { RequestHandler } from "express"
import { StrategyIdentifier } from "../consts"

export function checkAnonymous(req: Parameters<RequestHandler>[0]) {
  return Boolean(req.user?.strategyId.startsWith(StrategyIdentifier.Anonymous))
}

export const nonAnonymousMiddleware: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).send()
  if (checkAnonymous(req)) return res.status(403).send()

  next()
}
