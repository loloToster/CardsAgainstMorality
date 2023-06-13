import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  ValidateIf
} from "class-validator"
import { ApiCardPackEditableDetails } from "../../types"

export class PackDetailsDto implements ApiCardPackEditableDetails {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name!: string

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @ValidateIf((_, value) => value !== null)
  color!: string | undefined | null

  @IsOptional()
  @IsString()
  @MinLength(1)
  @ValidateIf((_, value) => value !== null)
  icon!: string | undefined | null
}
