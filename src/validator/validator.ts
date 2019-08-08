import * as Joi from "@hapi/joi";

export const validate = type => {
    return (req, res, next) => {
        const validResponse = Joi.validate(req.body, type);
        if (validResponse.error) return res.status(400).json({ code: "INVALID_INPUT", res: validResponse });

        req.body = validResponse.value;

        next();
    };
};
