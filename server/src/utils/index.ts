// https://stackoverflow.com/a/2450976/15331983
export function shuffle<T>(array: T[]) {
  let currentIndex = array.length
  let randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }

  return array
}
