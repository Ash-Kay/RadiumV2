import winston from "winston";
import kleur from "kleur";

const format = winston.format;
const { combine, timestamp, printf, colorize, json, metadata, uncolorize } = format;

const consoleFormat = printf((info) => {
    return `[${kleur.gray(info.timestamp)}] => ${kleur.underline(info.level)}: ${info.message}`;
});

const options = {
    file: {
        level: "silly",
        filename: "logs/logger.log",
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: combine(uncolorize(), timestamp(), metadata(), json()),
    },
    console: {
        level: "silly",
        handleExceptions: true,
        format: combine(metadata(), colorize(), timestamp(), consoleFormat),
    },
};

const logger = winston.createLogger({
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
});

export class LoggerStream {
    write(message: string): void {
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
