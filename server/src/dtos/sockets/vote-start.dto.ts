import { IsIn, IsInt, IsOptional } from "class-validator"
import { VOTE_TYPES } from "../../types"

export class VoteStartDto {
  @IsIn(VOTE_TYPES)
  type!: typeof VOTE_TYPES

  @IsInt()
  @IsOptional()
  playerId?: number
}
