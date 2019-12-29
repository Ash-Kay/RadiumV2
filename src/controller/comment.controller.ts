import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import { db } from "../database/db";
import logger from "../utils/logger";
import HttpStatusCode from "../utils/error.enum";

// *Get One
export const one = async (request: Request, response: Response, next: NextFunction) => {
    const comm = await db("comments")
        .select()
        .where({ id: request.params.id })
        .first();

    if (comm === undefined) {
        logger.info("Comment NOT found");
        response.status(HttpStatusCode.NOT_FOUND).end();
    } else {
        logger.info(`fetched comment with ID: ${request.params.id}`);
        response.status(HttpStatusCode.OK).send(comm);
    }
};

// *Delete Comm
export const remove = async (request: Request, response: Response, next: NextFunction) => {
    const delStatus: number = await db("comments")
        .where({ user_id: request.user.id, id: request.params.id })
        .del();

    if (delStatus === 0) {
        logger.info(`Comment not found or Unauthorized, commID: ${request.params.id} userID: ${request.user.id}`);
        response.status(HttpStatusCode.NOT_FOUND).end();
    } else {
        logger.info(`${request.user.id} DELETED comment ${request.params.id}`);
        response.status(HttpStatusCode.ACCEPTED).end();
    }
};

// *Edit?
