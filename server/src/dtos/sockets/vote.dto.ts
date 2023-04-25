import { IsBoolean } from "class-validator"
import { Vote } from "../../types"

export class VoteDto implements Vote {
  @IsBoolean()
  vote!: boolean
}
