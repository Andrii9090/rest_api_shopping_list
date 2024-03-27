import winston, { createLogger, transports } from "winston"

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
}

export default createLogger({
    level: 'debug',
    levels: logLevels,
    transports: [new transports.Console({ format: winston.format.simple(), })]
})