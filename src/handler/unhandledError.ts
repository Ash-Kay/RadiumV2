import logger from "../utils/logger";

export const uncaughtException = process.on("uncaughtException", e => {
    logger.error(e.message, e.stack);
    process.exit(1);
});

export const unhandledRejection = process.on("unhandledRejection", e => {
    logger.error(e);
    process.exit(1);
});
