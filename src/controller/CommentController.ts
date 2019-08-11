import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import { db } from "../database/db";

// *Delete Comm
export const remove = async (request: Request, response: Response, next: NextFunction) => {
    await db("comments")
        .where({ user_id: request.user.id, id: request.params.id })
        .del();

    response.status(201).json({ code: "COMM_DELETED" });
};
