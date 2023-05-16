import { ClassType, transformAndValidate } from "class-transformer-validator"
import { ClientToServerSocketEvents } from "../../types"

import { PartialSettingsDto, SettingsDto } from "./settings.dto"
import { SubmitionDto } from "./submition.dto"
import { VerdictDto } from "./verdict.dto"
import { VoteStartDto } from "./vote-start.dto"
import { VoteDto } from "./vote.dto"

type SocketValidators = {
  [K in keyof ClientToServerSocketEvents]?: ClassType<object>
}

const validators: Record<string, ClassType<object> | undefined> = {
  "sync-settings": PartialSettingsDto,
  start: SettingsDto,
  submit: SubmitionDto,
  verdict: VerdictDto,
  "vote-start": VoteStartDto,
  vote: VoteDto
} satisfies SocketValidators

export async function validate(ev: string, obj: object | null | undefined) {
  if (!obj) throw new Error()

  const Validator = validators[ev]
  if (!Validator) return obj

  return await transformAndValidate(Validator, obj, {
    validator: {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true
    }
  })
}
