import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../utils/httpStatusCode";

export const validateRequest = (bodyClass: any) => {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const result = plainToClass(bodyClass, request.body);

        try {
            await validateOrReject(result, { whitelist: true, forbidNonWhitelisted: true });
            request.body = result;
            next();
        } catch (error) {
            response.status(HttpStatusCode.BAD_REQUEST).send({ validationError: true, error });
            return;
        }
    };
};

export const validateParams = (paramsClass: any) => {
    return async (request: any, response: Response, next: NextFunction): Promise<void> => {
        const params = plainToClass(paramsClass, request.params);

        try {
            await validateOrReject(params, { whitelist: true, forbidNonWhitelisted: true });
            request.params = params;
            next();
        } catch (error) {
            response.status(HttpStatusCode.BAD_REQUEST).send({ validationError: true, error });
            return;
        }
    };
};
