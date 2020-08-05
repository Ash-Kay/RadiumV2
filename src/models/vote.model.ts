import { VoteState } from "../interface/db.enum";
import { User } from "../entity/user.entity";
import { Post } from "../entity/post.entity";

export default interface Vote {
    user: User;
    post: Post;
    vote: VoteState;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
