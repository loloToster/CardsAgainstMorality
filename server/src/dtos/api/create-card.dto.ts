import { IsString, MinLength, MaxLength, IsIn } from "class-validator"
import { CARD_COLORS } from "../../consts"
import { CardColor } from "../../types"

// todo: add draw & pick
export class CreateCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  text!: string

  @IsString()
  @IsIn(CARD_COLORS)
  color!: CardColor
}
