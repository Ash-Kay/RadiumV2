import Joi from "@hapi/joi";

export const userRegister = {
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(5).required(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    dob: Joi.date(),
    country: Joi.string(),
};

export const userLogin = {
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(5).required(),
};

export const userUpdate = {
    username: Joi.string().min(3).max(30).required(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    country: Joi.string(),
};

export const createPost = {
    title: Joi.string(),
    sensitive: Joi.boolean(),
    tags: Joi.array().items(Joi.string().min(1).max(15)),
};

export const createComment = {
    message: Joi.string().min(1).required(),
    tag_to: Joi.string().min(1),
};

export const createFact = {
    img_credit: Joi.string(),
    adult: Joi.boolean(),
    tags: Joi.array().items(Joi.string().min(1).max(15)),
};

export const none = {};
