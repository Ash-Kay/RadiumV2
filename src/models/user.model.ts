import { Role } from "../interface/db.enum";
import { Post } from "../entity/post.entity";
import { Vote } from "../entity/vote.entity";
import { Comment } from "../entity/comment.entity";

export default interface User {
    id: number;
    googleId: string;
    username: string;
    email: string;
    password: string;
    avatarUrl: string;
    firsName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    lastIp: string;
    lastOnline: Date;
    dob: Date;
    role: Role;
    country: string;
    posts: Post[];
    comments: Comment[];
    votes: Vote[];
}
