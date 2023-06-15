import { ClassType, transformAndValidate } from "class-transformer-validator"
import type { ValidatorOptions } from "class-validator"

export function subtractMs(date: Date, ms: number) {
  return new Date(date.getTime() - ms)
}

export function sum(arr: number[]) {
  return arr.reduce((s, v) => s + v, 0)
}

export async function validateDto<T extends object>(
  classType: ClassType<T>,
  object: object,
  additionalOpts?: ValidatorOptions
): Promise<T> {
  additionalOpts = additionalOpts ?? {}

  return await transformAndValidate(classType, object, {
    validator: {
      whitelist: true,
      ...additionalOpts
    }
  })
}
