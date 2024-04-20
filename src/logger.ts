import winston, { createLogger, transports } from "winston"
import config from "./config"

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
}

export default createLogger({
    level: config.production ? 'error' : 'debug',
    levels: logLevels,
    transports: [new transports.Console({ format: winston.format.simple(), }), new transports.File({ filename: 'error.log', level: 'error' })],
})