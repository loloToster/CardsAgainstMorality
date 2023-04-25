import { IsArray, IsInt } from "class-validator"
import { Verdict } from "../../types"

export class VerdictDto implements Verdict {
  @IsInt({ each: true })
  @IsArray()
  verdict!: number[]
}
