import { IsBoolean, IsString } from "class-validator"
import type { SettingsPack } from "../../types"

export class SettingsPackDto implements SettingsPack {
  @IsString()
  id!: string

  @IsBoolean()
  whites!: boolean

  @IsBoolean()
  blacks!: boolean
}
