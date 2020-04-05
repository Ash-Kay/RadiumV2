import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import * as fs from "fs";
import { db } from "../database/db";
import HttpStatusCode from "../utils/error.enum";
import logger from "../utils/logger";
import * as _ from "lodash";

// Import Entities
import Post from "../models/post.model";
import { Post as Post2 } from "../entity/post.entity";
import { User } from "../entity/user.entity";
import { Tag } from "../entity/tag.entity";

// Import Services
import { PostService } from "../service/post.service";
import { TagService } from "../service/tag.service";
config();

// *Create
export const create = async (request: Request, response: Response, next: NextFunction) => {
    if (!request.file) {
        return response.status(HttpStatusCode.BAD_REQUEST).end();
    }

    const postService = new PostService();
    const tagService = new TagService();

    let post = new Post2();
    post.title = request.body.title;
    post.sensitive = request.body.sensitive;
    post.file_path = request.file.path.replace(/\\/g, "/");

    const user = new User();
    user.id = request.user.id;
    post.user = user;

    post = await postService.insert(post);

    request.body.tags.forEach(async (tagText) => {
        const tag: Tag = await tagService.getByText(tagText);
        if (tag) {
            tagService.linkPost(tag, post);
        } else {
            const tag = new Tag();
            tag.tag_text = tagText;
            tag.posts = [post];
            tagService.insert(tag);
        }
    });

    response.status(HttpStatusCode.CREATED).json({ id: post.id });
};

// *GetFeed
export const feed = async (request: Request, response: Response, next: NextFunction) => {
    /* const posts: Post[] = await db
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
        .orderBy("created_at", "desc"); */

    const postService = new PostService();
    const posts = postService.getFeed();

    response.status(HttpStatusCode.OK).json(posts);
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
    const post: Post = await db("posts").select().where({ id: request.params.id }).first();

    if (post === undefined) {
        logger.info("Post NOT found");
        return response.status(HttpStatusCode.NOT_FOUND).end();
    } else if (post.user_id !== request.user.id) {
        logger.error(`AUTH FAILED: ${request.user.id} tried to delete ${post.user_id}'s post, Post ID: ${post.id}`);
        return response.status(HttpStatusCode.UNAUTHORIZED).end();
    }

    await db("posts").where({ id: request.params.id }).del(); //return boolean 0 not deleted 1 deleted

    fs.unlink(post.file_path, (err) => {
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
    await db("likes").where({ post_id: request.params.id, user_id: request.user.id }).del();

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
