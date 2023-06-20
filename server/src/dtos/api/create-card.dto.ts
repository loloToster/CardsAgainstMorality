import {
  IsString,
  MinLength,
  MaxLength,
  IsIn,
  IsOptional,
  IsInt,
  Min,
  Max
} from "class-validator"

import type { CardColor } from "../../types"
import {
  CARD_COLORS,
  MAX_DRAW,
  MAX_PICK,
  MIN_DRAW,
  MIN_PICK
} from "../../consts"

export class CreateCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  text!: string

  @IsString()
  @IsIn(CARD_COLORS)
  color!: CardColor

  @IsOptional()
  @IsInt()
  @Min(MIN_DRAW)
  @Max(MAX_DRAW)
  draw!: number | undefined

  @IsOptional()
  @IsInt()
  @Min(MIN_PICK)
  @Max(MAX_PICK)
  pick!: number | undefined
}
