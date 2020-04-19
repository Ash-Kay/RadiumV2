import { Response } from "express";
import { Request } from "../interface/express.interface";
import MakeResponse from "../interface/response.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
import HttpStatusCode from "../utils/httpStatusCode";
import logger from "../utils/logger";
import _ from "lodash";

import { UserToken } from "../interface/model.interfacet";

// Import Entities
// import { User } from "../entity/user.entity";

// Import Services
import { UserService } from "../service/user.service";
const userService = new UserService();

/**
 *  Get all users
 * */
export const all = async (request: Request, response: Response): Promise<void> => {
    const alluser = await userService.all();

    logger.info(`All users fetched.`);
    response.send(MakeResponse(true, "All users fetched successfully", alluser));
};

/**
 *  Signup user, hash the password
 * */
export const signup = async (request: Request, response: Response): Promise<void> => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    try {
        const user = await userService.save(request.body);

        logger.info(`${user.email} REGISTERED with ID: ${user.id}`, user);
        response.status(HttpStatusCode.CREATED).send(MakeResponse(true, "User registered successfully", user));
    } catch (err) {
        logger.error(`${request.body.email} error`, err);
        response.status(HttpStatusCode.BAD_REQUEST).send(MakeResponse(false, "Error", null, "FAILED_TO_REGISTER"));
    }
};

// *Login
export const login = async (request: Request, response: Response): Promise<void> => {
    const user = await userService.findByEmail(request.body.email);

    const isValid = await bcrypt.compare(request.body.password, user.password);
    let token;
    if (isValid) {
        const tokenUserDetails: UserToken = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
        };
        token = jwt.sign(tokenUserDetails, process.env.JWT_KEY, {
            expiresIn: "7d",
        });
    } else {
        logger.info(`AUTH FAILED: ${request.user.email}'s password does't match`);
        response
            .status(HttpStatusCode.BAD_REQUEST)
            .send(MakeResponse(false, "Email and password does't match", null, "FAILED_TO_LOGIN"));
        return;
    }

    logger.info(`${request.body.email}' LOGGED in`);
    response.status(HttpStatusCode.OK).send(MakeResponse(true, "Login Successful", token));
};

/* 
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
 */
