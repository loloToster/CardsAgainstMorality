import { IsInt } from "class-validator"

export class KickDto {
  @IsInt()
  playerId!: number
}
