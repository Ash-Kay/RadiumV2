import { Response } from "express";
import { Request } from "../interface/express.interface";
import MakeResponse from "../interface/response.interface";
import { UserToken } from "../interface/model.interfacet";
import HttpStatusCode from "../utils/httpStatusCode";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import logger from "../utils/logger";
import _ from "lodash";
config();

// Import Services
import { UserService } from "../service/user.service";

/**
 *  Get all users
 * */
export const all = async (request: Request, response: Response): Promise<void> => {
    const userService = new UserService();
    const alluser = await userService.all();

    logger.info(`All users fetched.`);
    response.send(MakeResponse(true, "All users fetched successfully", alluser));
};

/**
 *  Signup user, hash the password
 * */
export const signup = async (request: Request, response: Response): Promise<void> => {
    const userService = new UserService();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    try {
        const user = await userService.create(request.body);

        const filteredUser = _.pick(user, ["id", "username", "email", "avatarUrl", "country"]);
        logger.info(`${filteredUser.email} REGISTERED with ID: ${filteredUser.id}`, filteredUser);
        response.status(HttpStatusCode.CREATED).send(MakeResponse(true, "User registered successfully", filteredUser));
    } catch (err) {
        logger.error(`${request.body.email} ERROR in registration`, err);
        response.status(HttpStatusCode.BAD_REQUEST).send(MakeResponse(false, "Error", null, "FAILED_TO_REGISTER"));
    }
};

/**
 *  Login, validate email password, returns JWT
 * */
export const login = async (request: Request, response: Response): Promise<void> => {
    const userService = new UserService();
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

/**
 *  Find one user by ID
 * */
export const one = async (request: Request, response: Response): Promise<void> => {
    const userService = new UserService();
    const user = await userService.findById(+request.params.id);

    const filteredUser = _.pick(user, ["id", "username", "email", "avatarUrl", "lastOnline", "country"]);
    logger.info(`User with ID: ${request.params.id} is fetched`, filteredUser);
    response.send(MakeResponse(true, "User fetched successfully", filteredUser));
};

/**
 *  Update user
 * */
export const update = async (request: Request, response: Response): Promise<void> => {
    const userService = new UserService();
    await userService.update(request.user.id, request.body);

    logger.info(`User with ID: ${request.user.id}' UPDATED`);
    response.status(HttpStatusCode.ACCEPTED).send(MakeResponse(true, "User updated successfully"));
};

/**
 *  Get all posts from user
 * */
export const posts = async (request: Request, response: Response): Promise<void> => {
    const userService = new UserService();
    const posts = userService.getPosts(+request.params.id);

    logger.info(`${request.params.id}'s ALL post fetched`);
    response.status(HttpStatusCode.OK).send(MakeResponse(true, "Posts fetched succssfully", posts));
};
