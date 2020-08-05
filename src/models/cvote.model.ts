import { VoteState } from "../interface/db.enum";
import { User } from "../entity/user.entity";
import { Comment } from "../entity/comment.entity";

export default interface CVote {
    user: User;
    comment: Comment;
    vote: VoteState;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
