import Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (type) => {
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

export const validateObject = (object, type): boolean => {
    const validResponse = Joi.validate(object, type);
    if (validResponse.error) {
        return false;
    }
    return true;
};
