import { Request as ExpressRequest } from "express";
import { UserToken } from "./model.interfacet";

export interface Request extends ExpressRequest {
    user: UserToken;
}
