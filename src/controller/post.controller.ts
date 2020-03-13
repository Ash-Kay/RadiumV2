import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import * as fs from "fs";
import { db } from "../database/db";
import HttpStatusCode from "../utils/error.enum";
import logger from "../utils/logger";
import * as _ from "lodash";
import Post from "../models/post.model";
import { Post as Post2 } from "../entity/post.entity";
import { User } from "../entity/user.entity";
import { Tag } from "../entity/tag.entity";
import { getRepository } from "typeorm";
config();

// *Create
export const create = async (request: Request, response: Response, next: NextFunction) => {
    if (!request.file) {
        return response.status(HttpStatusCode.BAD_REQUEST).end();
    }
    /* const filterPost = _.pick(request.body, ["title", "adult"]);
    _.assign(filterPost, { user_id: request.user.id }, { file_path: request.file.path.replace(/\\/g, "/") });

    const id: number = await db("posts").insert(filterPost);

    const tags = request.body.tags.map(tag => ({ tag_name: tag }));
    const tag0Id = await db("tags").insert(tags);

    const post_tag = [];
    for (let i = tag0Id[0]; i < request.body.tags.length + tag0Id[0]; i++) {
        post_tag.push({ post_id: id[0], tag_id: i });
    }

    const post_tag0Id: number[] = await db("post_tag").insert(post_tag); */

    const postRepository = getRepository(Post2);
    const post = new Post2();
    post.title = request.body.title;
    post.sensitive = request.body.sensitive;
    post.file_path = request.file.path.replace(/\\/g, "/");

    const tagRepository = getRepository(Tag);
    const tags: Tag[] = [];

    request.body.tags.map(async tag => {
        /* const count = await tagRepository
            .createQueryBuilder()
            .where({ tag_text: tag })
            .getOne();

        console.log("count", count);

        if (count === undefined) { */
        const tempTag = new Tag();
        tempTag.tag_text = tag;
        tags.push(tempTag);
        // }
    });
    post.tags = tags;

    console.log("tags", tags);

    const user = new User();
    user.id = request.user.id;
    post.user = user;

    console.log("post", post);

    const result = await postRepository.save(post);

    logger.info(`${post.user.id} CREATED post with id ${post.id}`, result);
    response.status(HttpStatusCode.CREATED).send({ id: post.id });
};

// *GetFeed
export const feed = async (request: Request, response: Response, next: NextFunction) => {
    const posts: Post[] = await db
        .select(
            "posts.id",
            "posts.user_id",
            "posts.title",
            "posts.file_path",
            "posts.adult",
            "posts.updated_at",
            "posts.created_at",
            "users.username",
            "users.img_url as user_avatar"
        )
        .from("posts")
        .leftJoin("users", "users.id", "posts.user_id")
        .orderBy("created_at", "desc");

    logger.info("Feed Fetched");
    response.status(HttpStatusCode.OK).send(posts);
};

// *Get Post
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const [post]: Post[] = await db
        .select(
            "posts.id",
            "posts.user_id",
            "posts.title",
            "posts.file_path",
            "posts.adult",
            "posts.updated_at",
            "posts.created_at",
            "users.username",
            "users.img_url as user_avatar"
        )
        .from("posts")
        .leftJoin("users", "users.id", "posts.user_id")
        .where({ "posts.id": request.params.id });

    if (post === undefined) {
        logger.info("Post NOT found");
        response.status(HttpStatusCode.NOT_FOUND).end();
    } else {
        logger.info(`Post fetched with id: ${post.id}`, post);
        response.status(HttpStatusCode.OK).send(post);
    }
};

// *Delete Post
export const remove = async (request: Request, response: Response, next: NextFunction) => {
    const post: Post = await db("posts")
        .select()
        .where({ id: request.params.id })
        .first();

    if (post === undefined) {
        logger.info("Post NOT found");
        return response.status(HttpStatusCode.NOT_FOUND).end();
    } else if (post.user_id !== request.user.id) {
        logger.error(`AUTH FAILED: ${request.user.id} tried to delete ${post.user_id}'s post, Post ID: ${post.id}`);
        return response.status(HttpStatusCode.UNAUTHORIZED).end();
    }

    await db("posts")
        .where({ id: request.params.id })
        .del(); //return boolean 0 not deleted 1 deleted

    fs.unlink(post.file_path, err => {
        if (err) {
            logger.error("File CANT be DELETED from fs", err);
            response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).end();
        } else {
            logger.info("File DELETED from db and fs", post);
            response.status(HttpStatusCode.OK).end();
        }
    });
};

// *Like Post
export const like = async (request: Request, response: Response, next: NextFunction) => {
    await db("likes").insert({ post_id: request.params.id, user_id: request.user.id });

    logger.info(`${request.user.id} LIKED post: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).end();
};

// *UnLike
export const unlike = async (request: Request, response: Response, next: NextFunction) => {
    await db("likes")
        .where({ post_id: request.params.id, user_id: request.user.id })
        .del();

    logger.info(`${request.user.id} UNLIKED post: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).end();
};

// *Comment
export const comment = async (request: Request, response: Response, next: NextFunction) => {
    request.body.post_id = request.params.id;
    request.body.user_id = request.user.id;
    const id: number = await db("comments").insert(request.body);

    logger.info(`${request.user.id} COMMENTED on ${request.params.id}, commId: ${id}`, request.body);
    response.status(HttpStatusCode.CREATED).send(id);
};

// *All Comment on a post
export const getAllComm = async (request: Request, response: Response, next: NextFunction) => {
    const comms = await db("comments").where({ post_id: request.params.id });

    logger.info(`All comment on postID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(comms);
};
