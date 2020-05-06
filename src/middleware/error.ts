import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../utils/httpStatusCode";
import { makeApiResponse } from "../interface/response.interface";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const error = (error, request: Request, response: Response, next: NextFunction): void => {
    logger.error("from middle", error.message, error.stack);
    response
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send(makeApiResponse(false, "Something went wrong!!!", null, "WTF"));
};
