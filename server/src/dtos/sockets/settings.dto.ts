import {
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf
} from "class-validator"

import { SETTINGS_BOUNDARIES } from "../../consts"
import { SettingsData } from "../../types"

export class SettingsDto implements SettingsData {
  @IsInt()
  @Min(SETTINGS_BOUNDARIES.playersLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.playersLimit.max ?? Infinity)
  playersLimit!: number

  @IsInt()
  @Min(SETTINGS_BOUNDARIES.timeLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.timeLimit.max ?? Infinity)
  @ValidateIf((_, value) => value !== null)
  timeLimit!: number | null

  @IsInt()
  @Min(SETTINGS_BOUNDARIES.scoreLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.scoreLimit.max ?? Infinity)
  @ValidateIf((_, value) => value !== null)
  scoreLimit!: number | null

  @IsInt()
  @Min(SETTINGS_BOUNDARIES.roundLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.roundLimit.max ?? Infinity)
  @ValidateIf((_, value) => value !== null)
  roundLimit!: number | null

  @IsInt({ each: true })
  @IsArray()
  packs!: number[]
}

export class PartialSettingsDto implements Partial<SettingsData> {
  @IsOptional()
  @IsInt()
  @Min(SETTINGS_BOUNDARIES.playersLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.playersLimit.max ?? Infinity)
  playersLimit?: number

  @IsOptional()
  @IsInt()
  @Min(SETTINGS_BOUNDARIES.timeLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.timeLimit.max ?? Infinity)
  @ValidateIf((_, value) => value !== null)
  timeLimit?: number | null

  @IsOptional()
  @IsInt()
  @Min(SETTINGS_BOUNDARIES.scoreLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.scoreLimit.max ?? Infinity)
  @ValidateIf((_, value) => value !== null)
  scoreLimit?: number | null

  @IsOptional()
  @IsInt()
  @Min(SETTINGS_BOUNDARIES.roundLimit.min ?? -Infinity)
  @Max(SETTINGS_BOUNDARIES.roundLimit.max ?? Infinity)
  @ValidateIf((_, value) => value !== null)
  roundLimit?: number | null

  @IsOptional()
  @IsInt({ each: true })
  @IsArray()
  packs?: number[]
}
