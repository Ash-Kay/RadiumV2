import { Comment } from "../entity/comment.entity";
import { getRepository, Repository, UpdateResult, DeleteResult } from "typeorm";

export class CommentService {
    commentRepository: Repository<Comment>;

    constructor() {
        this.commentRepository = getRepository(Comment);
    }

    /**
     * Return comment
     * @param id
     * @returns comment
     */
    find(id: number): Promise<Comment> {
        return this.commentRepository.findOne(id);
    }

    /**
     * Return comment (includes soft deleted)
     * @param id
     * @returns comment
     */
    findWithSoftDeleted(id: number): Promise<Comment> {
        return this.commentRepository.findOne(id, { withDeleted: true });
    }

    /**
     * Mark comment as deleted
     * @param id
     * @returns UpdateResult
     */
    softDelete(id: number, userId: number): Promise<UpdateResult> {
        return this.commentRepository
            .createQueryBuilder()
            .softDelete()
            .from(Comment)
            .where({ id, user: { id: userId } })
            .execute();
    }

    /**
     * Permanently delete a comment
     * @param id
     * @returns DeleteResult
     */
    permaDelete(id: number): Promise<DeleteResult> {
        return this.commentRepository.delete(id);
    }

    /**
     * Update user by finding with ID
     * @param id
     * @returns userDetails
     * @returns Updated User
     */
    edit(id: number, userId: number, data: Comment): Promise<UpdateResult> {
        return this.commentRepository
            .createQueryBuilder()
            .update(Comment)
            .set(data)
            .where({ id, user: { id: userId } })
            .execute();
    }
}
