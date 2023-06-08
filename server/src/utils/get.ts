export interface Resp {
  status: number | undefined
  data: string
}

export async function get(url: string): Promise<Resp> {
  const getter = url.startsWith("https")
    ? await import("https")
    : await import("http")

  return await new Promise((res, rej) => {
    const request = getter.get(url, response => {
      let data = ""
      response.on("error", rej)
      response.on("data", chunk => (data += chunk.toString()))
      response.on("end", () =>
        res({
          status: response.statusCode,
          data
        })
      )
    })

    request.on("error", rej)
    request.end()
  })
}
