import * as Joi from "@hapi/joi";

export const userRegister = {
    username: Joi.string()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),
    password: Joi.string()
        .min(5)
        .required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    dob: Joi.date(),
    country: Joi.string()
};

export const userLogin = {
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),
    password: Joi.string()
        .min(5)
        .required()
};

export const none = {};
