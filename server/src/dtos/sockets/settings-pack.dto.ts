import { IsBoolean, IsInt } from "class-validator"
import type { SettingsPack } from "../../types"

export class SettingsPackDto implements SettingsPack {
  @IsInt()
  id!: number

  @IsBoolean()
  whites!: boolean

  @IsBoolean()
  blacks!: boolean
}
