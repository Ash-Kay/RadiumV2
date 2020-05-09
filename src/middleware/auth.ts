import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { NextFunction, Response } from "express";
import HttpStatusCode from "../utils/httpStatusCode";
import { Request } from "../interface/express.interface";

export const verifyAuth = (request: Request, response: Response, next: NextFunction): void => {
    try {
        const token = request.headers.authorization?.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_KEY);
        //save (decoded)user for future use
        request.user = user;
        next();
    } catch (e) {
        logger.error("JWT token INVALID");
        logger.warn("JWT token " + request.headers.authorization?.split(" ")[1]);
        return response.status(HttpStatusCode.BAD_REQUEST).end();
    }
};

/**
 * Verifies if User have right permission
 * verifyAuth must be present before this route
 * */
export const verifyAuthorization = (request: Request, response: Response, next: NextFunction): void => {
    try {
        if (request.user.role !== "ADMIN") {
            logger.error("Not Authorized");
            return response.status(HttpStatusCode.UNAUTHORIZED).end();
        }
        next();
    } catch (e) {
        logger.error("JWT token INVALID");
        return response.status(HttpStatusCode.UNAUTHORIZED).end();
    }
};
