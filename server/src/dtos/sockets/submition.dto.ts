import { IsArray, IsInt } from "class-validator"
import type { Submition } from "../../types"

export class SubmitionDto implements Submition {
  @IsInt({ each: true })
  @IsArray()
  submition!: number[]
}
