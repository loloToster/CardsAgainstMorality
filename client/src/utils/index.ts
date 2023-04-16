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

// https://stackoverflow.com/a/30810322/15331983
export async function copyToClipboard(text: string) {
  try {
    await window.navigator.clipboard.writeText(text)
  } catch {
    console.warn("could not copy with clipboard.writeText")

    const textArea = document.createElement("textarea")

    // Avoid scrolling to bottom
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"

    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand("copy")
    } catch (err) {
      console.error("Unable to copy to clipboard", err)
    }

    document.body.removeChild(textArea)
  }
}

export function deepclone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

export function loopThroughChildren(el: Element, cb: (el: Element) => void) {
  cb(el)

  const children = el.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    loopThroughChildren(child, cb)
  }
}
