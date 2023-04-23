import { IsArray, IsInt } from "class-validator"
import { Submition } from "../../types"

export class SubmitionDto implements Submition {
  @IsInt({ each: true })
  @IsArray()
  submition!: number[]
}
