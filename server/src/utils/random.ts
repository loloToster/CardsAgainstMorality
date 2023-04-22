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

// https://stackoverflow.com/a/1527820/15331983
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomElement<T>(array: T[]) {
  return array[getRandomInt(0, array.length - 1)]
}
