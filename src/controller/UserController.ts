import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const all = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const alluser = await userRepository.find();
    response.send(alluser);
};

// *SignUp
export const signup = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    const user = await userRepository.save(request.body);
    response.status(201).send(user);
};

// *Login
export const login = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail({ email: request.body.email });

    const isValid = await bcrypt.compare(request.body.password, user.password);
    if (isValid) {
        var token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_KEY, { expiresIn: "1d" });
    } else {
        console.log("Password Doe't match");
        response.status(400).json({ code: "AUTH_FAILED" });
    }

    response.status(200).json({
        code: "AUTH_SUCESS",
        token: token
    });
};

// *GetOne
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail(request.params.id);
    response.send(user);
};

// *Update
export const update = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const user = await userRepository.update(request.user.id, request.body); //todo req.user.id
    response.send(user);
};

// *AllPosts of a user
export const posts = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail(request.params.id, { relations: ["posts"] });
    response.send(user.posts);
};
