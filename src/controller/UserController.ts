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

export const signup = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    const saved = await userRepository.save(request.body);
    response.status(201).send(saved);
};

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

export const one = async (request: Request, response: Response, next: NextFunction) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail(request.params.id);
    response.send(user);
};
