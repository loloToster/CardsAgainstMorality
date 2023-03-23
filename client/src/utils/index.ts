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
