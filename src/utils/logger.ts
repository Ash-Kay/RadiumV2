import * as winston from "winston";
import * as kleur from "kleur";
import * as path from "path";

const format = winston.format;
const { combine, timestamp, printf, prettyPrint } = format;

const consoleFormat = printf(info => {
    return `[${kleur.gray(info.timestamp)}] => ${kleur.underline(info.level)}: ${info.message}`;
});

const options = {
    file: {
        level: "info",
        filename: "logs/logger.log",
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: combine(timestamp(), winston.format.json())
    },
    console: {
        level: "debug",
        handleExceptions: true,
        format: combine(winston.format.colorize(), timestamp(), consoleFormat)
    }
};

const logger = winston.createLogger({
    format: format.combine(format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] })),
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)]
});

export class LoggerStream {
    write(message: string) {
        logger.http(message.substring(0, message.lastIndexOf("\n")));
    }
}

export default logger;

/*
const levels = { 
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
*/
