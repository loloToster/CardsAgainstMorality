import {
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
  ValidateNested
} from "class-validator"
import { Type } from "class-transformer"

import { SETTINGS_BOUNDARIES } from "../../consts"
import type { SettingsData, SettingsPack } from "../../types"

import { SettingsPackDto } from "./settings-pack.dto"

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingsPackDto)
  packs!: SettingsPack[]
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingsPackDto)
  packs?: SettingsPack[]
}
