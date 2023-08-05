import { User } from "@prisma/client"
import { ApiUser } from "../types"
import { StrategyIdentifier } from "../consts"

export function userToApiUser(user: User | undefined | null): ApiUser {
  return {
    id: user?.id ?? -1,
    username: user?.username ?? "unknown",
    displayName: user?.displayName ?? "Unknown",
    picture: user?.picture ?? null,
    anonymous: user?.strategyId === StrategyIdentifier.Anonymous
  }
}
