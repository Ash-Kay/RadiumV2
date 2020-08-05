import { User } from "../entity/user.entity";
import { Vote } from "../entity/vote.entity";
import { Tag } from "../entity/tag.entity";
import { Comment } from "../entity/comment.entity";

export default interface Post {
    id: number;
    title: string;
    mediaUrl: string;
    sensitive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    user: User;
    comments: Comment[];
    vote: Vote[];
    tags: Tag[];
    width: number;
    height: number;
    aspectRatio: string;
    mime: string;
}
