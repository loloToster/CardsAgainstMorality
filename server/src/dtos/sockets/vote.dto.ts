import { IsBoolean } from "class-validator"
import type { Vote } from "../../types"

export class VoteDto implements Vote {
  @IsBoolean()
  vote!: boolean
}
