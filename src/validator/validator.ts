import * as Joi from "@hapi/joi";

export const validate = type => {
    return (req, res, next) => {
        const validResponse = Joi.validate(req.body, type);
        if (validResponse.error) return res.status(400).send(validResponse);

        req.body = validResponse.value;

        next();
    };
};
