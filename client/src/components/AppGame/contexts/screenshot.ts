import { ref } from "vue"
import html2canvas from "html2canvas"
import trimCanvas from "trim-canvas"

import { loopThroughChildren } from "@/utils"

const H_PADDING_PERCENTAGE = 0.06
const FOOTER_HEIGHT_PERCENTAGE = 0.07
const FOOTER_TEXT_PERCENTAGE = 0.035

type TakePictureCallback = (canvas: HTMLCanvasElement) => void

let takePictureCb: TakePictureCallback = () => null

export const target = ref<HTMLElement>()

export async function takePicture() {
  if (!target.value) return

  const cardsCanvas = await html2canvas(target.value, {
    backgroundColor: "transparent",
    // remove box shadow from target
    onclone(_, element) {
      loopThroughChildren(element, el => {
        if (window.getComputedStyle(el).boxShadow !== "none") {
          ;(el as HTMLElement).style?.setProperty("box-shadow", "none")
        }
      })
    }
  })

  trimCanvas(cardsCanvas)

  // add padding
  const canvas = document.createElement("canvas")
  const padding = Math.round((cardsCanvas.height * H_PADDING_PERCENTAGE) / 2)
  const footerHeight = Math.round(cardsCanvas.height * FOOTER_HEIGHT_PERCENTAGE)
  const footerTextSize = Math.round(cardsCanvas.height * FOOTER_TEXT_PERCENTAGE)

  canvas.height = cardsCanvas.height + footerHeight + padding * 2
  canvas.width = cardsCanvas.width + padding * 2

  const ctx = canvas.getContext("2d")

  if (!ctx) throw new Error("No ctx")

  ctx.drawImage(cardsCanvas, padding, padding)
  ctx.fillStyle = "white"
  const footerY = canvas.height - footerHeight
  ctx.fillRect(0, footerY, canvas.width, footerHeight)
  ctx.fillStyle = "black"
  ctx.font = `bold ${footerTextSize}px Arial`
  ctx.textBaseline = "middle"
  ctx.fillText(
    window.location.host,
    (footerHeight - footerTextSize) / 2,
    footerY + footerHeight / 2
  )

  takePictureCb(canvas)
}

export function onPictureTake(cb: TakePictureCallback) {
  takePictureCb = cb
}
