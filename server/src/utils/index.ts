export function subtractMs(date: Date, ms: number) {
  return new Date(date.getTime() - ms)
}

export function sum(arr: number[]) {
  return arr.reduce((s, v) => s + v, 0)
}
