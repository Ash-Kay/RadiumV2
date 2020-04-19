import Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";

export const validate = (type) => {
    return (request: Request, response: Response, next: NextFunction): void => {
        const validResponse = Joi.validate(request.body, type);
        if (validResponse.error) {
            response.status(400).send(validResponse);
            return;
        }

        request.body = validResponse.value;
        next();
    };
};
