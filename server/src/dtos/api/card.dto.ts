import { IsString, MinLength, MaxLength, IsIn } from "class-validator"

const colors = ["white", "black"] as const

// todo: add draw & pick
export class CardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  text!: string

  @IsString()
  @IsIn(colors)
  color!: (typeof colors)[number]
}
