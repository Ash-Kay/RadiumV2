import { Response } from "express";
import { Request } from "../interface/express.interface";
import { makeResponse } from "../interface/response.interface";
import { config } from "dotenv";
import HttpStatusCode from "../utils/httpStatusCode";
import logger from "../utils/logger";
import fs from "fs";
config();

// Import Services
import { CommentService } from "../service/comment.service";

/**
 *  Get comment by id
 * */
export const one = async (request: Request, response: Response): Promise<void> => {
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
export const remove = async (request: Request, response: Response): Promise<void> => {
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
export const permenentRemove = async (request: Request, response: Response): Promise<void> => {
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
export const edit = async (request: Request, response: Response): Promise<void> => {
    const commentService = new CommentService();

    const result = await commentService.edit(request.body.id, request.user.id, request.body);

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
