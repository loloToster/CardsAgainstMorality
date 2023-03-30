import winston from "winston"

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: "DD-MM-YY HH:mm:ss"
    }),
    winston.format.printf(info => {
      let log = `[${info.level}] ${info.message}`
      if (process.env.NODE_ENV !== "production")
        log = `${info.timestamp} | ` + log
      return log
    })
  )
})

export default logger
