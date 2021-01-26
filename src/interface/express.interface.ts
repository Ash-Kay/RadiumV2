import { Request as ExpressRequest } from "express";
import { UserToken } from "./model.interface";

export interface Request<T> extends ExpressRequest {
    user: UserToken;
    token: string | null;
    body: T;
}

export interface AuthHeaderRequest<T> extends Request<T> {
    headers: {
        authorization: string;
    };
}

export interface OptionalAuthHeaderRequest<T> extends Request<T> {
    headers: {
        authorization?: string;
    };
}
