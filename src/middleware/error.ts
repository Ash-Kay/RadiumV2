import logger from "../utils/logger";
import { Request, Response } from "express";
import HttpStatusCode from "../utils/httpStatusCode";

export const error = (error, request: Request, response: Response): void => {
    logger.error("from middle", error.message, error.stack);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).end();
};
