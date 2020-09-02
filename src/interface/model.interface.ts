import { Role } from "./db.enum";
import Post from "../models/post.model";
import { Comment } from "../entity/comment.entity";

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

export interface PostWithVoteSum extends Omit<Post, "comments" | "vote"> {
    voteSum: number;
    userId: number;
    username: string;
    avatarUrl: string;
}

export interface PostWithUserVote extends Omit<Post, "comments" | "vote"> {
    vote: number;
    userId: number;
    username: string;
    avatarUrl: string;
}

export interface PostWithUserVoteAndVoteSum extends Omit<Post, "comments" | "vote"> {
    vote: number;
    voteSum: number;
    userId: number;
    username: string;
    avatarUrl: string;
}

export interface CommentWithUserVote extends Omit<Comment, "post" | "vote"> {
    vote: number;
    userId: number;
    username: string;
    avatarUrl: string;
}
