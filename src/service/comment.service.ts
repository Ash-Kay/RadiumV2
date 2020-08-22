import { Comment } from "../entity/comment.entity";
import { getRepository, Repository, UpdateResult, DeleteResult } from "typeorm";
import { CVote } from "../entity/cvote.entity";

export class CommentService {
    commentRepository: Repository<Comment>;
    voteRepository: Repository<CVote>;

    constructor() {
        this.commentRepository = getRepository(Comment);
        this.voteRepository = getRepository(CVote);
    }

    /**
     * Return comment
     * @param id
     * @returns comment
     */
    find(id: number): Promise<Comment | undefined> {
        return this.commentRepository.findOne(id);
    }

    /**
     * Return comment (includes soft deleted)
     * @param id
     * @returns comment
     */
    findWithSoftDeleted(id: number): Promise<Comment | undefined> {
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

    /**
     * Upvote
     * @param {"user":id,"comment":id,"vote":VOTE}
     * @returns Upvote entity
     */
    vote(data: object): Promise<CVote> {
        return this.voteRepository.save(data);
    }

    /**
     * Remove Upvote
     * @param {"user":id,"comment":id}
     * @returns UpdateResult
     */
    removeVote(data: object): Promise<DeleteResult> {
        return this.voteRepository.delete(data);
    }

    /**
     * Get total vote count
     * @param commentId
     * @returns UpdateResult
     */
    getVoteSum(id: number): Promise<any> {
        return this.voteRepository
            .createQueryBuilder("vote")
            .select("SUM(vote.vote)", "sum")
            .where("vote.comment.id = :id", { id })
            .getRawOne();
    }
}
