import Joi from "@hapi/joi";

export const userRegister = {
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(5).required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    dob: Joi.date(),
    country: Joi.string(),
};

export const userLogin = {
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(5).required(),
};

export const userUpdate = {
    username: Joi.string().min(3).max(30),
    firstName: Joi.string(),
    lastName: Joi.string(),
    country: Joi.string(),
    avatarUrl: Joi.string(),
};

export const createPost = {
    title: Joi.string(),
    sensitive: Joi.boolean(),
    tags: Joi.array().items(Joi.string().min(1).max(15)),
};

export const createComment = {
    message: Joi.string().min(1).required(),
    tagTo: Joi.string().min(1),
};

export const updateComment = {
    message: Joi.string().min(1).required(),
    tagTo: Joi.string().min(1),
};

export const none = {};
