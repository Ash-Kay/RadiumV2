import { Response } from "express";
import { Request } from "../interface/express.interface";
import { makeResponse, makePaginationResponse } from "../interface/response.interface";
import { config } from "dotenv";
import HttpStatusCode from "../utils/httpStatusCode";
import logger from "../utils/logger";
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
        response.status(HttpStatusCode.BAD_REQUEST).end(makeResponse(false, "No file found!!!", {}, "NO_FILE_FOUND"));
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
    const page = +request.query.page;

    const posts = await postService.getFeed((page - 1) * 5, 5);

    logger.info("Feed Fetched");
    response
        .status(HttpStatusCode.OK)
        .send(
            makePaginationResponse(
                true,
                "Feed fetched sucessfully!",
                request.baseUrl + "/" + (page - 1),
                request.baseUrl + "/" + (page + 1),
                posts
            )
        );
};

/**
 *  Get one Post by ID
 * */
export const one = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const post = await postService.findAndLoadUser(+request.params.id);

    if (post === undefined) {
        logger.info("Post NOT found");
        response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(false, "Post not found!", {}, "POST NOT FOUND"));
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

    const result = await postService.softDelete(+request.params.id, request.user.id);

    if (result.raw.changedRows === 0) {
        logger.info("Post NOT found, or Not Authorized", result);
        response
            .status(HttpStatusCode.NOT_FOUND)
            .send(makeResponse(false, "Error Deleting Post", {}, "Error Deleting Post"));
        return;
    }

    logger.info(`Post removed with ID: ${request.params.id} by user with ID: ${request.user.id}`);
    response.send(makeResponse(true, "Post deleted", {}));
};

/**
 *  Permanently deletes a post
 * */
export const permenentRemove = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const post = await postService.findWithSoftDeleted(+request.params.id);

    if (post === undefined) {
        logger.info("Post NOT found");
        response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(false, "Post not found!", {}, "POST NOT FOUND"));
        return;
    }

    await postService.permaDelete(+request.params.id);

    fs.unlink(post.mediaUrl, (err) => {
        if (err) {
            logger.error("File CANT be DELETED from fs", err);
            response
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(makeResponse(false, "Error Deleting Post!", {}, "Error deleting post"));
            return;
        }
    });

    logger.info("File DELETED from db and fs", post);
    response.send(makeResponse(true, "Post deleted Permanently", {}));
};

/**
 *  Like a post
 * */
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

    try {
        like = await postService.like(like);
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            logger.error(`User with ID: ${request.user.id} ALREADY LIKED post with ID: ${request.params.id}`);
            response.status(HttpStatusCode.BAD_REQUEST).send(makeResponse(false, "Already Liked", {}, "alredy liked"));
        }
        return;
    }

    logger.info(`User with ID: ${request.user.id} LIKED post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Liked", like));
};

/**
 *  Unlike a post
 * */
export const unlike = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    await postService.unlike({ user: request.user.id, post: request.params.id });

    logger.info(`${request.user.id} UNLIKED post: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Unliked", {}));
};

/**
 *  Comment on post
 * */
export const comment = async (request: Request, response: Response): Promise<void> => {
    let filePath;
    if (request.file) {
        filePath = request.file.path.replace(/\\/g, "/");
    }

    const postService = new PostService();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    let comment: any = {
        message: request.body.message,
        mediaUrl: filePath,
        user: {
            id: request.user.id,
        },
        post: {
            id: request.params.id,
        },
        tagTo: {
            id: request.body.tagTo,
        },
    };

    comment = await postService.comment(comment);

    logger.info(`User with ID:${request.user.id} COMMENTED on ${request.params.id}, commId: ${comment.id}`, comment);
    response.status(HttpStatusCode.CREATED).send(makeResponse(true, "commented sccessfully", comment));
};

/**
 *  All comment on a post
 * */
export const allComments = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    const comms = await postService.getAllcomment(+request.params.id);

    logger.info(`All comment on postID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "all comments of post fetched successfully", comms));
};
