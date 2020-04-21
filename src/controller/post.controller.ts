import { Response } from "express";
import { Request } from "../interface/express.interface";
import makeResponse from "../interface/response.interface";
import { config } from "dotenv";
import HttpStatusCode from "../utils/httpStatusCode";
import logger from "../utils/logger";
import _ from "lodash";
import fs from "fs";
config();

// Import Services
import { PostService } from "../service/post.service";
import { TagService } from "../service/tag.service";

/**
 *  Create post
 * */
export const create = async (request: Request, response: Response): Promise<void> => {
    if (!request.file) {
        response.status(HttpStatusCode.BAD_REQUEST).end(makeResponse(false, "No file found!!!", null, "NO_FILE_FOUND"));
        return;
    }

    const postService = new PostService();
    const tagService = new TagService();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let post: any = {
        title: request.body.title,
        sensitive: request.body.sensitive,
        mediaUrl: request.file.path.replace(/\\/g, "/"),
        user: {
            id: request.user.id,
        },
    };

    post = await postService.create(post);

    request.body.tags.forEach(async (tagText) => {
        const tag = await tagService.getByText(tagText);
        if (tag) {
            tagService.linkPost(tag, post);
            logger.info(`Added tag ID: ${tag.id} to post ID: ${post.id}`);
        } else {
            const newTag = await tagService.create(tagText, post);
            logger.info(`CREATED tag ${newTag.tagText} added to post with ID: ${post.id}`, newTag);
        }
    });

    logger.info(`User with ID: ${post.user.id} CREATED post with ID: ${post.id}`, post);
    response.status(HttpStatusCode.CREATED).send(makeResponse(true, "Post Created Sucessfully", post));
};

/**
 *  Get Feed
 * */
export const feed = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const posts = await postService.getFeed();

    logger.info("Feed Fetched");
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Feed fetched sucessfully!", posts));
};

/**
 *  Get one Post by ID
 * */
export const one = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const post = await postService.findAndLoadUser(+request.params.id);

    if (post === undefined) {
        logger.info("Post NOT found");
        response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(false, "Post not found!", null, "POST NOT FOUND"));
        return;
    }

    logger.info(`Post with ID: ${request.params.id} fetched`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Post fetched sucessfully!", post));
};

/**
 *  Soft Delete a post
 * */
export const remove = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const post = await postService.findAndLoadUser(+request.params.id);

    if (post === undefined) {
        logger.info("Post NOT found");
        response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(false, "Post not found!", null, "POST NOT FOUND"));
        return;
    } else if (post.user.id !== request.user.id) {
        logger.error(`AUTH FAILED: ${request.user.id} tried to delete ${post.user.id}'s post, Post ID: ${post.id}`);
        response
            .status(HttpStatusCode.UNAUTHORIZED)
            .send(makeResponse(false, "Error Deleting Post!", null, "Error deleting post"));
        return;
    }

    await postService.softDelete(+request.params.id);

    response.send(makeResponse(true, "Post deleted"));
};

/**
 *  Permanently deletes a post
 * */
export const permenentRemove = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const post = await postService.findWithSoftDeleted(+request.params.id);

    if (post === undefined) {
        logger.info("Post NOT found");
        response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(false, "Post not found!", null, "POST NOT FOUND"));
        return;
    }

    await postService.permaDelete(+request.params.id);

    fs.unlink(post.mediaUrl, (err) => {
        if (err) {
            logger.error("File CANT be DELETED from fs", err);
            response
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(makeResponse(false, "Error Deleting Post!", null, "Error deleting post"));
            return;
        }
    });
    logger.info("File DELETED from db and fs", post);

    response.send(makeResponse(true, "Post deleted Permanently"));
};

// *Like Post
export const like = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    let like: any = {
        user: {
            id: request.user.id,
        },
        post: {
            id: request.params.id,
        },
    };

    like = await postService.like(like);

    logger.info(`User with ID: ${request.user.id} LIKED post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Liked", like));
};
/* 
// *UnLike
export const unlike = async (request: Request, response: Response  ): Promise<void> => {
    await db("likes").where({ post_id: request.params.id, user_id: request.user.id }).del();

    logger.info(`${request.user.id} UNLIKED post: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).end();
};

// *Comment
export const comment = async (request: Request, response: Response  ): Promise<void> => {
    request.body.post_id = request.params.id;
    request.body.user_id = request.user.id;
    const id: number = await db("comments").insert(request.body);

    logger.info(`${request.user.id} COMMENTED on ${request.params.id}, commId: ${id}`, request.body);
    response.status(HttpStatusCode.CREATED).send(id);
};

// *All Comment on a post
export const getAllComm = async (request: Request, response: Response  ): Promise<void> => {
    const comms = await db("comments").where({ post_id: request.params.id });

    logger.info(`All comment on postID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(comms);
};
 */
