import sanitize from "sanitize-html"

export function sanitizeCardContent(text: string) {
  text = sanitize(text, {
    allowedTags: ["b", "i", "u", "br"],
    allowedAttributes: {}
  })

  if (!text) throw new Error("Text empty after sanitation")

  return text
}
