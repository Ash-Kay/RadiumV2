import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../utils/httpStatusCode";
import { makeResponse } from "../interface/response.interface";

export const error = (error: Error, request: Request, response: Response, next: NextFunction): void => {
    logger.error("🚨 Error Route 🚨", error.message, error.stack);
    response
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send(makeResponse(false, "Something went wrong!!!", {}, "WTF"));
    process.exit(1);
};

process
    .on("unhandledRejection", (reason, p) => {
        throw reason;
    })
    .on("uncaughtException", (err) => {
        process.exit(1);
    });
