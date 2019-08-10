import { getRepository, getConnection } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { Like } from "../entity/Like";
import { Comment } from "../entity/Comment";
import { config } from "dotenv";
import * as fs from "fs";
config();

// *Create
export const create = async (request: Request, response: Response, next: NextFunction) => {
    const postRepository = getRepository(Post);

    const post = new Post();
    post.title = request.body.title;
    post.imgUrl = request.hostname + ":" + process.env.PORT + "/" + request.file.path;
    post.sensitive = request.body.sensitive;

    const owner = new User();
    owner.id = request.user.id;
    post.owner = owner;

    const posted = await postRepository.save(post);
    response.status(201).send(posted);
};

// *Get Post
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const postRepository = getRepository(Post);
    const post = await postRepository.findOneOrFail(request.params.id);
    response.send(post);
};

// *Delete Post
export const remove = async (request: Request, response: Response, next: NextFunction) => {
    const postRepository = getRepository(Post);
    const post = await postRepository.findOneOrFail(request.params.id, { relations: ["owner"] });

    if (post.owner.id !== request.user.id) {
        return response.status(401).json({ code: "AUTH_ERROR" });
    }

    console.log("post deleted form db : ", post.imgUrl);
    const deleted = await postRepository.delete(request.params.id);

    const fsPath = post.imgUrl.split("/")[1];

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
    const likeRepository = getRepository(Like);
    const newLike = new Like();
    newLike.owner = new User().id = request.user.id;
    newLike.post = new Post().id = request.params.id;
    await likeRepository.save(newLike);
    response.status(202).json({ code: "POST_LIKED" });
};

// *UnLike
export const unlike = async (request: Request, response: Response, next: NextFunction) => {
    /* await getConnection().manager.query(
        `DELETE from likes WHERE postId = ${request.params.id} AND ownerId = ${request.user.id};`
    ); */
    const likeRepository = getRepository(Like);
    const newLike = new Like();
    newLike.owner = new User().id = request.user.id;
    newLike.post = new Post().id = request.params.id;
    await likeRepository.remove(newLike);

    response.status(202).json({ code: "POST_UNLIKED" });
};

// *Comment
export const comment = async (request: Request, response: Response, next: NextFunction) => {
    const comment = await getConnection().manager.query(
        `INSERT INTO comments (message, imgUrl, ownerId, postId) VALUES ("${request.body.message}", "${
            request.body.imgUrl
        }", ${request.user.id}, ${request.params.id});`
    );
    console.log(comment);

    //const comment = await getConnection().createQueryBuilder().relation(Co)

    response.status(201).json({ code: "COMM_POSTED" });
};
