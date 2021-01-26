import fs from "fs";
import { Response } from "express";
import { DeepPartial } from "typeorm";

import logger from "../utils/logger";
import HttpStatusCode from "../utils/httpStatusCode";
import { UpdateCommentBody } from "../validator/schema";
import { Request } from "../interface/express.interface";
import { makeResponse } from "../interface/response.interface";

//Entities
import { CVote } from "../entity/cvote.entity";

//Services
import { CommentService } from "../service/comment.service";
import { VoteState } from "../interface/db.enum";

/**
 *  Get comment by id
 * */
export const one = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    const comm = await commentService.find(+request.params.id);

    if (comm === undefined) {
        logger.info("Comment NOT found");
        response.status(HttpStatusCode.NOT_FOUND).send(makeResponse(false, "commnet not found", {}, "CMT NOT FUND"));
        return;
    }

    logger.info(`fetched comment with ID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "comment fetched succefully", comm));
};

/**
 *  Soft Delete Comment
 * */
export const remove = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    const result = await commentService.softDelete(+request.params.id, request.user.id);

    if (result.raw.changedRows === 0) {
        logger.info("Comment NOT found, or Not Authorized", result);
        response
            .status(HttpStatusCode.NOT_FOUND)
            .send(makeResponse(false, "Error Deleting Comment", {}, "Error Deleting Comment"));
        return;
    }

    logger.info(`Comment removed with ID: ${request.params.id} by user with ID: ${request.user.id}`);
    response.send(makeResponse(true, "Comment deleted", {}));
};

/**
 *  Permanently deletes a comment
 * */
export const permenentRemove = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    const comment = await commentService.findWithSoftDeleted(+request.params.id);

    if (comment === undefined) {
        logger.info("Comment NOT found");
        response
            .status(HttpStatusCode.NOT_FOUND)
            .send(makeResponse(false, "Comment not found!", {}, "Comment NOT FOUND"));
        return;
    }

    await commentService.permaDelete(+request.params.id);

    if (comment.mediaUrl !== null)
        fs.unlink(comment.mediaUrl, (err) => {
            if (err) {
                logger.error("File CANT be DELETED from fs", err);
                response
                    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                    .send(makeResponse(false, "Error Deleting Comment!", {}, "Error deleting Comment"));
                return;
            }
        });

    logger.info("File DELETED from db and fs", comment);
    response.send(makeResponse(true, "Comment deleted Permanently", {}));
};

/**
 *  Edit Comment
 * */
export const edit = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();
    //TODO VERIFY
    const result = await commentService.edit(+request.params.id, request.user.id, request.body);

    if (result.raw.changedRows === 0) {
        logger.info("Comment NOT found, or Not Authorized", result);
        response
            .status(HttpStatusCode.NOT_FOUND)
            .send(makeResponse(false, "Error Editing Comment", {}, "Error Editing Comment"));
        return;
    }

    logger.info(`User with ID: ${request.user.id}' UPDATED comment with ID: `);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Comment updated successfully", {}));
};

/**
 *  Upvote a comment
 * */
export const upvote = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    let upvote: DeepPartial<CVote> = {
        user: {
            id: request.user.id,
        },
        comment: {
            id: +request.params.id,
        },
        vote: VoteState.UPVOTE,
    };

    try {
        await commentService.removeVote({ user: upvote.user, comment: upvote.comment });
        upvote = await commentService.vote(upvote);
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            logger.error(`User with ID: ${request.user.id} ALREADY UPVOTED comment with ID: ${request.params.id}`);
            response
                .status(HttpStatusCode.BAD_REQUEST)
                .send(makeResponse(false, "Already Upvoted", {}, "alredy upvoted"));
        } else {
            logger.error(
                `ERROR! when User with ID: ${request.user.id} tried UPVOTE comment with ID: ${request.params.id}`,
                e
            );
            response
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(makeResponse(false, "Something went wrong", {}, "Something went wrong"));
        }
        return;
    }

    logger.info(`User with ID: ${request.user.id} UPVOTED comment with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Comment Upvoted", upvote));
};

/**
 *  Remove vote of comment
 * */
export const removeVote = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    await commentService.removeVote({ user: { id: request.user.id }, comment: { id: +request.params.id } });

    logger.info(`${request.user.id} REMOVE VOTE comment: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Comment vote Removed", {}));
};

/**
 *  Downvote a comment
 * */
export const downvote = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    let downvote: DeepPartial<CVote> = {
        user: {
            id: request.user.id,
        },
        comment: {
            id: +request.params.id,
        },
        vote: VoteState.DOWNVOTE,
    };

    try {
        await commentService.removeVote({ user: downvote.user, comment: downvote.comment });
        downvote = await commentService.vote(downvote);
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            logger.error(`User with ID: ${request.user.id} ALREADY DOWNVOTED comment with ID: ${request.params.id}`);
            response
                .status(HttpStatusCode.BAD_REQUEST)
                .send(makeResponse(false, "Already Downvoted", {}, "alredy downvoted"));
        } else {
            logger.error(
                `ERROR! when User with ID: ${request.user.id} tried DOWNVOTE comment with ID: ${request.params.id}`,
                e
            );
            response
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send(makeResponse(false, "Something went wrong", {}, "Something went wrong"));
        }
        return;
    }

    logger.info(`User with ID: ${request.user.id} DOWNVOTED comment with ID: ${request.params.id}`);
    response.status(HttpStatusCode.ACCEPTED).send(makeResponse(true, "Comment Downvoted", downvote));
};

/**
 *  Get total sum of upvote/downvote
 * */
export const countVote = async (request: Request<never>, response: Response): Promise<void> => {
    const commentService = new CommentService();

    const { sum } = await commentService.getVoteSum(+request.params.id);

    logger.info(`Fetched Vote Count for comment with ID: ${request.params.id}`);
    response.status(HttpStatusCode.OK).send(makeResponse(true, "Vote Count Fetched", { voteSum: sum }));
};
