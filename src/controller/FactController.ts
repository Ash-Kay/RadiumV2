import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import { db } from "../database/db";
config();

export const all = async (request: Request, response: Response, next: NextFunction) => {
    const posts = await db("facts")
        .select()
        .orderBy("created_at", "desc");
    response.status(200).json(posts);
};

export const create = async (request: Request, response: Response, next: NextFunction) => {
    if (!request.file) {
        return response.status(400).json({ code: "FILE_REQUIRED" });
    }
    request.body.user_id = request.user.id;
    request.file.path = request.file.path.replace("\\", "/");
    request.body.file_path = request.hostname + ":" + process.env.PORT + "/" + request.file.path;
    await db("facts").insert(request.body); // return id
    response.status(201).json({ code: "FACT_CREATED" });
};
