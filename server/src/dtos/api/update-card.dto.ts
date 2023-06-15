import { IsOptional, IsString, MinLength, MaxLength } from "class-validator"

// todo: add draw & pick
export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  text!: string | undefined
}
