import _ from "lodash";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { Profile } from "passport";
import { LoginTicket, OAuth2Client } from "google-auth-library";

import logger from "../utils/logger";
import config from "../config/env.config";
import HttpStatusCode from "../utils/httpStatusCode";
import { UserToken } from "../interface/model.interface";
import { makeResponse } from "../interface/response.interface";
import { Request, AuthHeaderRequest } from "../interface/express.interface";
import { UserLoginBody, UserSignUpBody, UserUpdateBody } from "../validator/schema";

//Services
import { UserService } from "../service/user.service";

//Entities
import { User } from "../entity/user.entity";
import { Role } from "../interface/db.enum";

/**
 *  Get all users
 * */
export const all = async (request: Request<never>, response: Response): Promise<void> => {
    const userService = new UserService();
    const alluser = await userService.all();

    logger.info(`All users fetched.`);
    response.send(makeResponse(true, "All users fetched successfully", alluser));
};

/**
 *  Signup user, hash the password
 * */
export const signup = async (request: Request<UserSignUpBody>, response: Response): Promise<void> => {
    const userService = new UserService();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    try {
        const user = await userService.create(request.body);

        const filteredUser = _.pick(user, ["id", "username", "email", "avatarUrl", "country"]);
        logger.info(`${filteredUser.email} REGISTERED with ID: ${filteredUser.id}`, filteredUser);
        response.status(HttpStatusCode.CREATED).send(makeResponse(true, "User registered successfully", filteredUser));
    } catch (err) {
        logger.error(`${request.body.email} ERROR in registration`, err);
        response.status(HttpStatusCode.BAD_REQUEST).send(makeResponse(false, "Error", {}, "FAILED_TO_REGISTER"));
    }
};

/**
 *  Login, validate email password, returns JWT
 * */
export const login = async (request: Request<UserLoginBody>, response: Response): Promise<void> => {
    const userService = new UserService();
    const user = await userService.findByEmail(request.body.email);

    if (user === undefined) {
        logger.info(`AUTH FAILED: ${request.body.email}'s password does't match`);
        response
            .status(HttpStatusCode.BAD_REQUEST)
            .send(makeResponse(false, "Email and password does't match", {}, "FAILED_TO_LOGIN"));
        return;
    }

    const isValid = await bcrypt.compare(request.body.password, user.password);
    let token;
    if (isValid) {
        const tokenUserDetails: UserToken = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            googleId: user.googleId,
            avatarUrl: user.avatarUrl,
        };
        token = jwt.sign(tokenUserDetails, config.jwtKey, {
            expiresIn: "7d",
        });
    } else {
        logger.info(`AUTH FAILED: ${request.body.email}'s password does't match`);
        response
            .status(HttpStatusCode.BAD_REQUEST)
            .send(makeResponse(false, "Email and password does't match", {}, "FAILED_TO_LOGIN"));
        return;
    }

    logger.info(`${request.body.email}' LOGGED in`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Login Successful", { token }));
};

export const logOut = async (request: Request<never>, response: Response): Promise<void> => {
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(makeResponse(false, "Not used", {}));
};

/**
 *  GoogleSignup, Takes google token and create or find existing user then returns token
 * */
export const loginWithGoogle = async (request: AuthHeaderRequest<never>, response: Response): Promise<void> => {
    const userService = new UserService();
    const googleToken = request.headers.authorization.split(" ")[1];
    const client = new OAuth2Client(config.google.clientId);
    let ticket: LoginTicket;
    try {
        ticket = await client.verifyIdToken({ idToken: googleToken });
    } catch (e) {
        logger.error(`Google Token verification failed`, e);
        response.status(HttpStatusCode.UNAUTHORIZED).send(makeResponse(false, "Login Failed", {}));
        return;
    }
    const payload = ticket.getPayload();

    let token;
    if (payload !== undefined) {
        let user = await userService.findByGoogleId(payload.sub);

        if (user === undefined) {
            const newUser: Partial<User> = {
                googleId: payload.sub,
                email: payload.email,
                username:
                    (payload.name || payload.email?.substring(0, payload.email.indexOf("@")) || "USER").replace(
                        / /g,
                        ""
                    ) + Math.floor(Math.random() * 1000),
                firsName: payload.given_name,
                lastName: payload.family_name,
                avatarUrl: payload.picture,
            };
            user = await userService.create(newUser);
        }

        const tokenUserDetails: UserToken = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            googleId: user.googleId,
            avatarUrl: user.avatarUrl,
        };
        token = jwt.sign(tokenUserDetails, config.jwtKey, {
            expiresIn: "7d",
        });

        logger.info(`${user.email}' LOGGED in`);
        response.status(HttpStatusCode.OK).send(makeResponse(true, "Login Successful", { token }));
    } else {
        logger.error(`Google Login Payload UNDEFINED!`);
        response.status(HttpStatusCode.UNAUTHORIZED).send(makeResponse(false, "Login Failed", {}));
    }
};

/**
 *  Takes google profile id and returns token
 * */
export const googleAuthWeb = async (profile: Profile): Promise<string | void> => {
    const userService = new UserService();
    let user: Partial<User | undefined> = await userService.findByGoogleId(profile.id);
    if (user === undefined) {
        user = {
            googleId: profile.id,
            email: profile.emails?.[0].value,
            //Todo find better method to genrate random name
            username: profile.displayName.replace(/ /g, "") + Math.floor(Math.random() * 1000),
            firsName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatarUrl: profile.photos?.[0].value,
        };
        await userService.create(user);
    }

    const savedUser = await userService.findByGoogleId(profile.id);

    if (savedUser !== undefined) {
        const tokenUserDetails: UserToken = {
            id: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
            username: savedUser.username,
            googleId: savedUser.googleId,
            avatarUrl: savedUser.avatarUrl,
        };
        const token = jwt.sign(tokenUserDetails, config.jwtKey, {
            expiresIn: "7d",
        });

        return token;
    } else {
        logger.error("Unable to find saved User or create new User!!!");
        return undefined;
    }
};

/**
 *  This runs when google web auth successful
 * */
export const googleRedirect = async (request: Request<{ email: string }>, response: Response): Promise<void> => {
    logger.info(`${request.body.email}' LOGGED in`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Login Successful", { token: request.token }));
};

/**
 *  Find one user by ID
 * */
export const one = async (request: Request<never>, response: Response): Promise<void> => {
    const userService = new UserService();
    const user = await userService.findById(+request.params.id);

    if (user === undefined) {
        logger.info(`User not found with ID :${request.params.id}`);
        response.status(HttpStatusCode.OK).send(makeResponse(false, "No such user found", {}, "USER NOT FOUND"));
        return;
    }

    const filteredUser = _.pick(user, ["id", "username", "avatarUrl", "lastOnline", "country"]);
    logger.info(`User with ID: ${request.params.id} is fetched`, filteredUser);
    response.send(makeResponse(true, "User fetched successfully", filteredUser));
};

/**
 *  Update user
 * */
export const update = async (request: Request<UserUpdateBody>, response: Response): Promise<void> => {
    const userService = new UserService();
    await userService.update(request.user.id, request.body);

    logger.info(`User with ID: ${request.user.id}' UPDATED`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "User updated successfully", {}));
};

/**
 *  Get all posts from user
 * */
export const posts = async (request: Request<never>, response: Response): Promise<void> => {
    const userService = new UserService();
    const user = await userService.loadUserWithPosts(+request.params.id);

    if (user == undefined) {
        logger.info(`Tried to fetch post of unexisting with ID :${request.params.id}`);
        response.status(HttpStatusCode.OK).send(makeResponse(false, "No such user found", {}, "USER NOT FOUND"));
        return;
    }
    logger.info(`${request.params.id}'s ALL post fetched`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Posts fetched succssfully", user.posts));
};

/**
 *  Get user data from cookie
 * */
export const me = async (request: Request<never>, response: Response): Promise<void> => {
    if (!request.user) {
        response.send(
            makeResponse(true, "User fetched successfully", {
                id: 0,
                email: "",
                role: Role.USER,
                username: "",
                googleId: "",
            })
        );
        return;
    }

    const userService = new UserService();
    const user = await userService.findById(+request.user.id);

    if (user === undefined) {
        logger.info(`User not found with ID :${request.user.id}`);
        response.status(HttpStatusCode.OK).send(makeResponse(false, "No such user found", {}, "USER NOT FOUND"));
        return;
    }

    const filteredUser = _.pick(user, [
        "id",
        "email",
        "googleId",
        "role",
        "username",
        "avatarUrl",
        "lastOnline",
        "country",
    ]);
    logger.info(`User with ID: ${request.user.id} is fetched`, filteredUser);
    response.send(makeResponse(true, "User fetched successfully", filteredUser));
};
