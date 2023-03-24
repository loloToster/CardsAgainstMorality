export function moveItem<T>(
  source: T[],
  target: T[],
  predicate: (value: T) => boolean
) {
  const idx = source.findIndex(predicate)

  if (idx < 0) return false

  const item = source[idx]
  target.push(item)
  source.splice(idx, 1)

  return true
}

// https://stackoverflow.com/a/1527820/15331983
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
