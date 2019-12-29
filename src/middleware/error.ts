import logger from "../utils/logger";
import HttpStatusCode from "../utils/error.enum";

export const error = (error, req, res, next) => {
    logger.error(error.message, error.stack);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).end();
};
