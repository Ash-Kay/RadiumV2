import * as Joi from "@hapi/joi";
import * as schema from "./schema";

export const validate = (type: string) => {
    return (req, res, next) => {
        const validResponse = Joi.validate(req.body, schema[type]);
        if (validResponse.error) return res.status(400).json({ code: "INVALID_INPUT", res: validResponse });

        req.body = validResponse.value;

        next();
    };
};
