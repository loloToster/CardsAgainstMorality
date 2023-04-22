export function subtractMs(date: Date, ms: number) {
  return new Date(date.getTime() - ms)
}
