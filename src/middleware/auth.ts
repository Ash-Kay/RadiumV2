import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import config from "../config/env.config";
import { NextFunction, Response } from "express";
import HttpStatusCode from "../utils/httpStatusCode";
import getCookieFromRequest from "../utils/getCookie";
import { Request, AuthHeaderRequest, OptionalAuthHeaderRequest } from "../interface/express.interface";

export const verifyAuth = (request: AuthHeaderRequest<unknown>, response: Response, next: NextFunction): void => {
    try {
        const token = getCookieFromRequest(request)["memenese-token"];

        if (!token) throw Error("!JWT empty!");
        const user = jwt.verify(token, config.jwtKey);
        //save (decoded)user for future use
        request.user = user;
        next();
    } catch (e) {
        logger.error("JWT token INVALID or Something went wrong", e);
        return response.status(HttpStatusCode.UNAUTHORIZED).end();
    }
};

export const verifyOptionalAuth = (
    request: OptionalAuthHeaderRequest<unknown>,
    response: Response,
    next: NextFunction
): void => {
    try {
        const token = getCookieFromRequest(request)["memenese-token"];
        if (token) {
            const user = jwt.verify(token, config.jwtKey);
            //save (decoded)user for future use
            request.user = user;
        }
        next();
    } catch (e) {
        logger.error("Optional JWT token INVALID or Something went wrong", e);
        return response.status(HttpStatusCode.UNAUTHORIZED).end();
    }
};

/**
 * Verifies if User have right permission
 * verifyAuth must be present before this route
 * */
export const verifyAuthorization = (request: Request<unknown>, response: Response, next: NextFunction): void => {
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
