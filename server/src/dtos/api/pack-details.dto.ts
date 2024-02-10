import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  ValidateIf,
  IsInt,
  IsArray,
  ArrayMaxSize,
  IsIn
} from "class-validator"

import type { ApiCardPackEditableDetails } from "../../types"
import { MAX_PACK_NAME_LEN, MAX_PACK_TAGS, PackPrivacy } from "../../consts"

export class PackDetailsDto implements ApiCardPackEditableDetails {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_PACK_NAME_LEN)
  name!: string

  @IsIn([PackPrivacy.Public, PackPrivacy.OnlyRoom, PackPrivacy.Private])
  privacy!: number

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

  @IsInt()
  type!: number

  @IsArray()
  @ArrayMaxSize(MAX_PACK_TAGS)
  @IsInt({ each: true })
  tags!: number[]
}
