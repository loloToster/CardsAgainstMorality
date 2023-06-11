import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches
} from "class-validator"

export class PackDetailsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name!: string

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  color!: string | undefined

  @IsOptional()
  @IsString()
  @MinLength(1)
  icon!: string | undefined
}
