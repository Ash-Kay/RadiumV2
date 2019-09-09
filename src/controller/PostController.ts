import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import * as fs from "fs";
import { db } from "../database/db";
config();

// *Create
export const create = async (request: Request, response: Response, next: NextFunction) => {
    if (!request.file) {
        return response.status(400).json({ code: "FILE_REQUIRED" });
    }
    request.body.user_id = request.user.id;
    request.file.path = request.file.path.replace("\\", "/");
    request.body.file_path = request.hostname + ":" + process.env.PORT + "/" + request.file.path;
    await db("posts").insert(request.body); // return id
    response.status(201).json({ code: "POST_CREATED" });
};

// *PostFeed
export const feed = async (request: Request, response: Response, next: NextFunction) => {
    const posts = await db("posts")
        .select()
        .orderBy("created_at", "desc");
    response.status(200).json(posts);
};

// *Get Post
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const post = await db("posts")
        .select()
        .where({ id: request.params.id })
        .first();
    response.send(post);
};

// *Delete Post
export const remove = async (request: Request, response: Response, next: NextFunction) => {
    const post = await db("posts")
        .select()
        .where({ id: request.params.id })
        .first();

    if (post === undefined || post.user_id !== request.user.id) {
        return response.status(401).json({ code: "AUTH_ERROR" });
    }

    await db("posts")
        .where({ id: request.params.id })
        .del();

    const fsPath = post.file_path.split("/")[1];

    fs.unlink(fsPath, err => {
        if (err) {
            console.log("File cant be deleted from fs", err);
            response.status(500).json({ code: "SERVER_ERROR" });
        } else {
            console.log("file deleted from db and fs");
            response.status(200).json({ code: "POST_DELETED" });
        }
    });
};

// *Like Post
export const like = async (request: Request, response: Response, next: NextFunction) => {
    await db("likes").insert({ post_id: request.params.id, user_id: request.user.id });
    response.status(202).json({ code: "POST_LIKED" });
};

// *UnLike
export const unlike = async (request: Request, response: Response, next: NextFunction) => {
    await db("likes")
        .where({ post_id: request.params.id, user_id: request.user.id })
        .del();
    response.status(202).json({ code: "POST_UNLIKED" });
};

// *Comment
export const comment = async (request: Request, response: Response, next: NextFunction) => {
    request.body.post_id = request.params.id;
    request.body.user_id = request.user.id;
    await db("comments").insert(request.body);

    response.status(201).json({ code: "COMM_POSTED" });
};
