import { CVote } from "../entity/cvote.entity";
import { User } from "../entity/user.entity";
import { Post } from "../entity/post.entity";

export default interface Comments {
    id: number;
    message: string;
    mediaUrl: string;
    vote: CVote[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    tagTo: User;
    user: User;
    post: Post;
}
