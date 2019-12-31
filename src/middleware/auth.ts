import * as jwt from "jsonwebtoken";
import logger from "../utils/logger";
import HttpStatusCode from "../utils/error.enum";

export const verifyAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_KEY);
        //save (decoded)user for future use
        req.user = user;
        next();
    } catch (e) {
        logger.error("JWT token INVALID");
        return res.status(HttpStatusCode.UNAUTHORIZED).end();
    }
};

export const verifyAuthorization = (req, res, next) => {
    try {
        if (req.user.type !== "god") {
            logger.error("Not Authorized");
            return res.status(HttpStatusCode.UNAUTHORIZED).end();
        }
        next();
    } catch (e) {
        logger.error("JWT token INVALID");
        return res.status(HttpStatusCode.UNAUTHORIZED).end();
    }
};
