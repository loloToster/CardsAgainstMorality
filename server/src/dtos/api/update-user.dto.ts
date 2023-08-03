import { IsString, MinLength, MaxLength } from "class-validator"
import { MIN_USERNAME_LEN, MAX_USERNAME_LEN } from "../../consts"

export class UpdateUserDto {
  @IsString()
  @MinLength(MIN_USERNAME_LEN)
  @MaxLength(MAX_USERNAME_LEN)
  username!: string

  @IsString()
  @MaxLength(MAX_USERNAME_LEN)
  displayName!: string
}
