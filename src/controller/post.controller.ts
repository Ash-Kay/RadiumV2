import { Response } from "express";
import { Request } from "../interface/express.interface";
import { makeResponse, makePaginationResponse } from "../interface/response.interface";
import { RecursivePartial } from "../interface/utilsTypes";
import { config } from "dotenv";
import HttpStatusCode from "../utils/httpStatusCode";
import { VoteState } from "../interface/db.enum";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import logger from "../utils/logger";
import _ from "lodash";
import fs from "fs";
config();

//Entities
import { Post } from "../entity/post.entity";
import { Vote } from "../entity/vote.entity";
import { Comment } from "../entity/comment.entity";

// Import Services
import { PostService } from "../service/post.service";
import { TagService } from "../service/tag.service";

// Config
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo();

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

    let post: RecursivePartial<Post> = {
        title: request.body.title,
        sensitive: request.body.sensitive,
        mediaUrl: request.file.path.replace(/\\/g, "/"),
        user: {
            id: request.user.id,
        },
    };

    post = await postService.create(post);

    request.body.tags?.forEach(async (tagText) => {
        const tag = await tagService.getByText(tagText);
        if (tag) {
            tagService.linkPost(tag, post);
            logger.info(`Added tag ID: ${tag.id} to post ID: ${post.id}`);
        } else {
            const newTag = await tagService.create(tagText, post);
            logger.info(`CREATED tag ${newTag.tagText} added to post with ID: ${post.id}`, newTag);
        }
    });

    logger.info(`User with ID: ${post?.user?.id} CREATED post with ID: ${post.id}`, post);
    response.status(HttpStatusCode.CREATED).send(makeResponse(true, "Post Created Sucessfully", post));
};

/**
 *  Get Feed
 * */
export const feed = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();
    const page = +request.query.page;

    //TODO: HotFix for first request not authenticated
    if (page <= 0) {
        logger.info("Feed Fetched");
        response
            .status(HttpStatusCode.OK)
            .send(
                makePaginationResponse(
                    true,
                    "Feed fetched sucessfully!",
                    request.baseUrl + "/" + (page - 1),
                    request.baseUrl + "/" + (page + 1),
                    []
                )
            );
        return;
    }

    if (request.user === undefined || request.user === null) {
        const rawPosts = await postService.getFeed((page - 1) * 5, 5);

        const posts = _.map(rawPosts, (e) =>
            _.assign(e, {
                timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                sensitive: Boolean(+e.sensitive),
            })
        );

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
    } else {
        const rawPosts = await postService.getFeedWithVotes(request.user.id, (page - 1) * 5, 5);

        const posts = _.chain(rawPosts)
            .map((e) =>
                _.assign(e, {
                    timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                    user: { id: e.userId, username: e.username, avatarUrl: e.avatarUrl },
                    sensitive: Boolean(+e.sensitive),
                    vote: +e.vote,
                })
            )
            .map((e) => _.omit(e, ["userId", "username", "avatarUrl"]))
            .value();

        logger.info("Personalized Feed Fetched");
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
    }
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
 *  Upvote a post
 * */
export const upvote = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    let upvote: RecursivePartial<Vote> = {
        user: {
            id: request.user.id,
        },
        post: {
            id: +request.params.id,
        },
        vote: VoteState.UPVOTE,
    };

    try {
        await postService.removeVote({ user: upvote.user, post: upvote.post });
        upvote = await postService.vote(upvote);
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            logger.error(`User with ID: ${request.user.id} ALREADY UPVOTED post with ID: ${request.params.id}`);
            response
                .status(HttpStatusCode.BAD_REQUEST)
                .send(makeResponse(false, "Already Upvoted", {}, "alredy upvoted"));
        } else {
            logger.error(
                `ERROR! when User with ID: ${request.user.id} tried UPVOTE post with ID: ${request.params.id}`,
                e
            );
            response
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(makeResponse(false, "Something went wrong", {}, "Something went wrong"));
        }
        return;
    }

    logger.info(`User with ID: ${request.user.id} UPVOTED post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Upvoted", upvote));
};

/**
 *  Remove vote of post
 * */
export const removeVote = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    await postService.removeVote({ user: request.user.id, post: request.params.id });

    logger.info(`${request.user.id} REMOVE VOTE post: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post vote Removed", {}));
};

/**
 *  Downvote a post
 * */
export const downvote = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    let downvote: RecursivePartial<Vote> = {
        user: {
            id: request.user.id,
        },
        post: {
            id: +request.params.id,
        },
        vote: VoteState.DOWNVOTE,
    };

    try {
        await postService.removeVote({ user: downvote.user, post: downvote.post });
        downvote = await postService.vote(downvote);
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            logger.error(`User with ID: ${request.user.id} ALREADY DOWNVOTED post with ID: ${request.params.id}`);
            response
                .status(HttpStatusCode.BAD_REQUEST)
                .send(makeResponse(false, "Already Downvoted", {}, "alredy downvoted"));
        } else {
            logger.error(
                `ERROR! when User with ID: ${request.user.id} tried DOWNVOTE post with ID: ${request.params.id}`,
                e
            );
            response
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(makeResponse(false, "Something went wrong", {}, "Something went wrong"));
        }
        return;
    }

    logger.info(`User with ID: ${request.user.id} DOWNVOTED post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Downvoted", downvote));
};

/**
 *  Get total sum of upvote/downvote
 * */
export const countVote = async (request: Request, response: Response): Promise<void> => {
    const postService = new PostService();

    const { sum } = await postService.getVoteSum(+request.params.id);

    logger.info(`Fetched Vote Count for post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Vote Count Fetched", { voteSum: sum }));
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

    let comment: RecursivePartial<Comment> = {
        message: request.body.message,
        mediaUrl: filePath,
        user: {
            id: request.user.id,
        },
        post: {
            id: +request.params.id,
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

    const rawComms: Comment[] = await postService.getAllcomment(+request.params.id);

    const comms = _.map(rawComms, (e) =>
        _.assign(e, {
            timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
        })
    );

    logger.info(`All comment on postID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "all comments of post fetched successfully", comms));
};
