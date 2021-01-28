import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (bodyClass: any) => {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const result = plainToClass(bodyClass, request.body);

        try {
            await validateOrReject(result, { whitelist: true, forbidNonWhitelisted: true });
            request.body = result;
            next();
        } catch (error) {
            response.status(400).send(error);
            return;
        }
    };
};
