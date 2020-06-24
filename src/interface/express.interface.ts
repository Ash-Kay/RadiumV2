import { Request as ExpressRequest } from "express";
import { UserToken } from "./model.interface";

export interface Request extends ExpressRequest {
    user: UserToken;
    token: string | null;
}

export interface AuthHeaderRequest extends Request {
    headers: {
        authorization: string;
    };
}
