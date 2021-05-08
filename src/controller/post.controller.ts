import { Response } from "express";
import { DeepPartial } from "typeorm";
import fs from "fs";

import logger from "../utils/logger";
import { VoteState } from "../interface/db.enum";
import HttpStatusCode from "../utils/httpStatusCode";
import { Request } from "../interface/express.interface";
import { CreateCommentBody, CreatePostBody } from "../validator/schema";
import { makeResponse, makePaginationResponse } from "../interface/response.interface";

//Entities
import { Vote } from "../entity/vote.entity";
import { Comment } from "../entity/comment.entity";

//Services
import { PostService } from "../service/post.service";
import { TagService } from "../service/tag.service";

//Mapper
import {
    mapGetFeedSqlToResponse,
    mapGetOnePostSqlToResponse,
    mapCreatePostResponseToEntity,
    mapGetPostCommentSqlToResponse,
    mapCreatCommentResponseToEntity,
    mapGetFeedWithVoteSqlToResponse,
    mapGetOneWithVotePostSqlToResponse,
    mapGetPostCommentWithVoteSqlToResponse,
} from "../mapper";

/**
 *  Create post
 * */
export const create = async (request: Request<CreatePostBody>, response: Response): Promise<void> => {
    if (!request.file) {
        response.status(HttpStatusCode.BAD_REQUEST).end(makeResponse(false, "No file found!!!", {}, "NO_FILE_FOUND"));
        return;
    }

    const postService = new PostService();
    const tagService = new TagService();

    const data = mapCreatePostResponseToEntity(request.body, request.user, request.file);
    const post = await postService.create(data);

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

    logger.info(`User with ID: ${post.user.id} CREATED post with ID: ${post.id}`, post);
    response.status(HttpStatusCode.CREATED).send(
        makeResponse(true, "Post Created Sucessfully", {
            ...post,
            user: { ...post.user, avatarUrl: request.user.avatarUrl, username: request.user.username },
        })
    );
};

/**
 *  Get Feed
 * */
export const feed = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();
    if (typeof request.query.page !== "string") {
        logger.warn("Wrong query parameter", request.query.page);
        response
            .status(HttpStatusCode.BAD_REQUEST)
            .send(makeResponse(false, "Wrong query parameter", request.query.page));
        return;
    }

    let page = +request.query.page;

    if (!page || page <= 0) {
        page = 1;
    }

    if (!request.user) {
        const rawPosts = await postService.getFeedWithVoteSum((page - 1) * 5, 5);

        const posts = mapGetFeedSqlToResponse(rawPosts);

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
        const rawPosts = await postService.getFeedWithVotesAndVoteSum(request.user.id, (page - 1) * 5, 5);

        const posts = mapGetFeedWithVoteSqlToResponse(rawPosts);

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
export const one = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();

    if (!request.user) {
        const rawPost = await postService.findPostWithVoteSum(+request.params.id);
        if (!rawPost) {
            logger.info(`Post with ID: ${request.params.id} not found`);
            response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(true, "Post not found!", {}));
            return;
        }
        const post = mapGetOnePostSqlToResponse(rawPost);

        if (!post) {
            logger.info("Post NOT found");
            response
                .status(HttpStatusCode.NOT_FOUND)
                .send(makeResponse(false, "Post not found!", {}, "POST NOT FOUND"));
            return;
        }
        logger.info(`Post with ID: ${request.params.id} fetched`);
        response.status(HttpStatusCode.OK).send(makeResponse(true, "Post fetched sucessfully!", post));
    } else {
        const rawPost = await postService.findPostWithVoteAndVoteSum(+request.params.id, request.user.id);
        if (!rawPost) {
            logger.info(`Post with ID: ${request.params.id} not found`);
            response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(true, "Post not found!", {}));
            return;
        }
        const post = mapGetOneWithVotePostSqlToResponse(rawPost);

        if (!post) {
            logger.info("Post NOT found");
            response
                .status(HttpStatusCode.NOT_FOUND)
                .send(makeResponse(false, "Post not found!", {}, "POST NOT FOUND"));
            return;
        }
        logger.info(`Post with ID: ${request.params.id} fetched with auth`);
        response.status(HttpStatusCode.OK).send(makeResponse(true, "Post fetched sucessfully!", post));
    }
};

/**
 *  Soft Delete a post
 * */
export const remove = async (request: Request<never>, response: Response): Promise<void> => {
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
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post deleted", {}));
};

/**
 *  Permanently deletes a post
 * */
export const permenentRemove = async (request: Request<never>, response: Response): Promise<void> => {
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
export const upvote = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();

    let upvote: DeepPartial<Vote> = {
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
    const { voteSum } = await postService.getVoteSum(+request.params.id);

    logger.info(`User with ID: ${request.user.id} UPVOTED post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Upvoted", { ...upvote, voteSum }));
};

/**
 *  Remove vote of post
 * */
export const removeVote = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();

    await postService.removeVote({ user: request.user.id, post: request.params.id });
    const { voteSum } = await postService.getVoteSum(+request.params.id);

    logger.info(`${request.user.id} REMOVE VOTE post: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post vote Removed", { voteSum }));
};

/**
 *  Downvote a post
 * */
export const downvote = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();

    let downvote: DeepPartial<Vote> = {
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
    const { voteSum } = await postService.getVoteSum(+request.params.id);

    logger.info(`User with ID: ${request.user.id} DOWNVOTED post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Post Downvoted", { ...downvote, voteSum }));
};

/**
 *  Get total sum of upvote/downvote
 * */
export const countVote = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();

    const { sum } = await postService.getVoteSum(+request.params.id);

    logger.info(`Fetched Vote Count for post with ID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Vote Count Fetched", { voteSum: sum }));
};

/**
 *  Comment on post
 * */
export const comment = async (request: Request<CreateCommentBody>, response: Response): Promise<void> => {
    const postService = new PostService();

    const data = mapCreatCommentResponseToEntity(request.body, +request.params.id, request.user, request.file);

    const comment = await postService.comment(data);

    logger.info(`User with ID:${request.user.id} COMMENTED on ${request.params.id}, commId: ${comment.id}`, comment);
    response.status(HttpStatusCode.CREATED).send(makeResponse(true, "commented sccessfully", comment));
};

/**
 *  All comment on a post
 * */
export const allComments = async (request: Request<never>, response: Response): Promise<void> => {
    const postService = new PostService();
    if (!request.user) {
        const rawComms: Comment[] = await postService.getAllcomment(+request.params.id);

        const comms = mapGetPostCommentSqlToResponse(rawComms);

        logger.info(`All comment on postID: ${request.params.id}`);
        response.status(HttpStatusCode.OK).send(makeResponse(true, "all comments of post fetched successfully", comms));
    } else {
        const rawComms = await postService.getAllCommentsWithVotes(+request.params.id, request.user.id);

        const comms = mapGetPostCommentWithVoteSqlToResponse(rawComms);

        logger.info(`All comment on postID With Auth: ${request.params.id}`);
        response.status(HttpStatusCode.OK).send(makeResponse(true, "all comments of post fetched successfully", comms));
    }
};

/**
 *  All tags on a post
 * */
export const allTags = async (request: Request<never>, response: Response): Promise<void> => {
    const tagService = new TagService();
    const tags = await tagService.getTags(+request.params.id);
    logger.info(`All tags on postID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "all tags of post fetched successfully", tags));
};
