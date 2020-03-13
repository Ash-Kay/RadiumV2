import { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { config } from "dotenv";
import { db } from "../database/db";
import HttpStatusCode from "../utils/error.enum";
import logger from "../utils/logger";
import * as _ from "lodash";
import User from "../models/user.model";
import { getRepository } from "typeorm";
import { User as User2 } from "../entity/user.entity";
config();

export const all = async (request: Request, response: Response, next: NextFunction) => {
    const alluser = await db.select().from("users");
    response.send(alluser);
};

// *SignUp
export const signup = async (request: Request, response: Response, next: NextFunction) => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    const userRepository = getRepository(User2);
    try {
        const user = await userRepository.save(request.body);
        logger.info(`${request.body.email} REGISTERED`, user);
        response.status(HttpStatusCode.CREATED).send(user);
    } catch (err) {
        logger.error(`${request.body.email} error`, err);
        response.status(HttpStatusCode.BAD_REQUEST).end();
    }
    // const user: User = await db("users").insert(request.body);
};

// *Login
export const login = async (request: Request, response: Response, next: NextFunction) => {
    const user: User = await db("users")
        .where({ email: request.body.email })
        .first();

    const isValid = await bcrypt.compare(request.body.password, user.password);
    if (isValid) {
        var token = jwt.sign(
            { email: user.email, id: user.id, type: user.user_type, username: user.username },
            process.env.JWT_KEY,
            {
                expiresIn: "7d"
            }
        );
    } else {
        logger.info(`AUTH FAILED: ${request.user.email}'s password does't match`);
        response.status(HttpStatusCode.BAD_REQUEST).end();
    }

    logger.info(`${request.body.email}' LOGGED in`);
    response.status(HttpStatusCode.OK).send(token);
};

// *GetOne
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const user: User = await db("users")
        .select()
        .where({ id: request.params.id })
        .first();

    const filterUser = _.pick(user, ["id", "username", "img_url", "last_online", "country"]);
    logger.info(`${request.params.id}' fetched`, filterUser);
    response.send(filterUser);
};

// *Update the logged in user
export const update = async (request: Request, response: Response, next: NextFunction) => {
    await db("users")
        .where({ id: request.user.id })
        .update(request.body);
    logger.info(`${request.user.email}' UPDATED`);
    response.status(HttpStatusCode.ACCEPTED).end();
};

// *AllPosts of a user
export const posts = async (request: Request, response: Response, next: NextFunction) => {
    const post = await db
        .select()
        .from("posts")
        .where({ user_id: request.params.id });
    logger.info(`${request.params.id}'s ALL post fetched`);
    response.status(HttpStatusCode.OK).send(post);
};
