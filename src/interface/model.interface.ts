import { Role } from "./db.enum";
import Post from "../models/post.model";

export interface UserToken {
    email: string;
    id: number;
    googleId: string;
    role: Role;
    username: string;
    avatarUrl: string;
}

export interface PostFeedResponse extends Post {
    timeago: string;
}

export interface PostWithUserVote extends Omit<Post, "comments" | "vote"> {
    vote: number;
    userId: number;
    username: string;
    avatarUrl: string;
}
