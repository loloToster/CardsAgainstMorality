import type { RequestHandler } from "express"

const { ADMIN_KEY } = process.env

export function checkAdmin(req: Parameters<RequestHandler>[0]) {
  return !ADMIN_KEY || req.query.key === ADMIN_KEY
}

export const isAdminMiddleware: RequestHandler = (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).send()

  next()
}
