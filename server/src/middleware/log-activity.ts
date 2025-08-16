import { Request } from "express"
import DeviceDetector from "node-device-detector"
import db from "../modules/db"
import { get } from "../utils/get"

interface ipApiResponse {
  status: string
  countryCode?: string
  regionName?: string
  city?: string
  mobile?: boolean
}

const detector = new DeviceDetector()

export async function logActivity(req: Request) {
  const path = req.path
  const referer = req.get("Referrer")

  if (path.length > 64 || (referer?.length || 0) > 512)
    throw new Error("Bad activity")

  const userAgent = req.get("User-Agent")
  const ip = req.ip

  const res = await get(
    `http://ip-api.com/json/${ip}?fields=status,countryCode,regionName,city,mobile`
  )

  let countryCode, regionName, city, mobile, os, browser, device

  if (res.status === 200) {
    const data = JSON.parse(res.data) as ipApiResponse
    const { status } = data

    if (status === "success") {
      countryCode = data.countryCode
      regionName = data.regionName
      city = data.city
      mobile = data.mobile
    }
  }

  if (userAgent) {
    const res = detector.detect(userAgent)
    os = res.os.name
    browser = res.client.name
    device = res.device.type
  }

  await db.activity.create({
    data: {
      path,
      referer,
      countryCode,
      regionName,
      city,
      mobile,
      os,
      browser,
      device
    }
  })
}
