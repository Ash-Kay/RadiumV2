import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../utils/httpStatusCode";
import CreateResponse from "../interface/response.interface";

export const error = (error, request: Request, response: Response, next: NextFunction): void => {
    logger.error("from middle", error.message, error.stack);
    response
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send(CreateResponse(false, "Something went wrong!!!", null, "WTF"));
};
