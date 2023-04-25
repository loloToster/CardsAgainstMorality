import { IsArray, IsInt, ValidateIf } from "class-validator"
import { StartData } from "../../types"

export class StartDto implements StartData {
  @IsInt()
  playersLimit!: number

  @IsInt()
  @ValidateIf((_, value) => value !== null)
  timeLimit!: number | null

  @IsInt()
  @ValidateIf((_, value) => value !== null)
  scoreLimit!: number | null

  @IsInt()
  @ValidateIf((_, value) => value !== null)
  roundLimit!: number | null

  @IsInt({ each: true })
  @IsArray()
  packs!: number[]
}
