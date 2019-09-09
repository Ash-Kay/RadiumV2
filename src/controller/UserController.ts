import { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { config } from "dotenv";
import { db } from "../database/db";
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

    const user = await db("users").insert(request.body);
    response.status(201).send(user);
};

// *Login
export const login = async (request: Request, response: Response, next: NextFunction) => {
    const user = await db("users")
        .where({ email: request.body.email })
        .first();

    const isValid = await bcrypt.compare(request.body.password, user.password);
    if (isValid) {
        var token = jwt.sign({ email: user.email, id: user.id, type: user.user_type }, process.env.JWT_KEY, {
            expiresIn: "1d"
        });
    } else {
        console.log("Password Does't match");
        response.status(400).json({ code: "AUTH_FAILED" });
    }

    response.status(200).json({
        code: "AUTH_SUCESS",
        token: token
    });
};

// *GetOne
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const user = await db("users")
        .select()
        .where({ id: request.params.id })
        .first();
    response.send(user);
};

// *Update
export const update = async (request: Request, response: Response, next: NextFunction) => {
    await db("users")
        .where({ id: request.user.id })
        .update(request.body); // returns id(Maybe)
    response.status(202).json({ code: "USER_UPDATED" });
};

// *AllPosts of a user
export const posts = async (request: Request, response: Response, next: NextFunction) => {
    const post = await db
        .select()
        .from("posts")
        .where({ user_id: request.params.id });
    response.status(200).send(post);
};
