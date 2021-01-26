import { Post } from "../entity/post.entity";
import { Vote } from "../entity/vote.entity";
import { Comment } from "../entity/comment.entity";
import { getRepository, Repository, UpdateResult, DeleteResult, DeepPartial } from "typeorm";
import { CommentWithUserVote, PostWithUserVoteAndVoteSum, PostWithVoteSum } from "../interface/model.interface";

export class PostService {
    postRepository: Repository<Post>;
    voteRepository: Repository<Vote>;
    commentRepository: Repository<Comment>;

    constructor() {
        this.postRepository = getRepository(Post);
        this.voteRepository = getRepository(Vote);
        this.commentRepository = getRepository(Comment);
    }

    /**
     * Insert Post into database
     * @param Post data
     * @returns Post entity
     */
    async create(data: DeepPartial<Post>): Promise<Post> {
        return this.postRepository.save(data);
    }

    /**
     * Fetches posts
     * @returns List of Postss
     */
    getFeedWithVoteSum(skip: number, take: number): Promise<PostWithVoteSum[]> {
        return this.postRepository.query(
            `
            SELECT op.*, users.username, users.avatarUrl,
            (
                SELECT SUM(vote) FROM votes
                INNER JOIN posts ON posts.id = votes.postId
                WHERE posts.id = op.id
            ) AS voteSum
                FROM posts op
                INNER JOIN users ON users.id = op.userId
                WHERE op.deletedAt IS NULL
                ORDER BY op.createdAt DESC LIMIT ?, ?;`,
            [skip, take]
        );
    }

    /**
     * Fetches posts, add isUp/Downvoted parameter, add VoteSum parameter
     * @returns List of Posts
     */
    getFeedWithVotesAndVoteSum(userId: number, skip: number, take: number): Promise<PostWithUserVoteAndVoteSum[]> {
        return this.postRepository.query(
            `
            SELECT op.*, users.username, users.avatarUrl,
            (
                SELECT vote FROM votes
                INNER JOIN users ON users.id = votes.userId
                INNER JOIN posts ON posts.id = votes.postId
                WHERE users.id =? AND posts.id = op.id
            ) AS vote ,
            (
                SELECT SUM(vote) FROM votes
                INNER JOIN posts ON posts.id = votes.postId
                WHERE posts.id = op.id
            ) AS voteSum
                FROM posts op
                INNER JOIN users ON users.id = op.userId
                WHERE op.deletedAt IS NULL
                ORDER BY op.createdAt DESC LIMIT ?, ?;`,
            [userId, skip, take]
        );
    }

    /**
     * Return posts
     * @param id
     * @returns post
     */
    find(id: number): Promise<Post | undefined> {
        return this.postRepository.findOne(id);
    }

    /**
     * Return posts (includes soft deleted)
     * @param id
     * @returns post
     */
    findWithSoftDeleted(id: number): Promise<Post | undefined> {
        return this.postRepository.findOne(id, { withDeleted: true });
    }

    /**
     * Return posts with user and voteSum
     * @param id
     * @returns post with user inside
     */
    findPostWithVoteSum(postId: number): Promise<Post | undefined> {
        return this.postRepository.query(
            `SELECT op.*, users.username, users.avatarUrl, (
                SELECT SUM(vote) FROM votes 
                INNER JOIN posts ON posts.id = votes.postId
                WHERE posts.id = op.id
            ) AS voteSum
                FROM posts op
                INNER JOIN users ON users.id = op.userId
                WHERE op.id = ?;`,
            [postId]
        );
    }

    /**
     * Return posts with user and voteSum
     * @param id
     * @returns post with user inside
     */
    findPostWithVoteAndVoteSum(postId: number, userId: number): Promise<Post | undefined> {
        return this.postRepository.query(
            `SELECT op.*, users.username, users.avatarUrl, (
                SELECT vote FROM votes
                INNER JOIN users ON users.id = votes.userId
                INNER JOIN posts ON posts.id = votes.postId
                WHERE users.id = ? AND posts.id = op.id
            ) AS vote,
            (
                SELECT SUM(vote) FROM votes 
                INNER JOIN posts ON posts.id = votes.postId
                WHERE posts.id = op.id
            ) AS voteSum
                FROM posts op
                INNER JOIN users ON users.id = op.userId
                WHERE op.id = ?;`,
            [userId, postId]
        );
    }

    /**
     * Mark post as deleted
     * @param id
     * @returns UpdateResult
     */
    softDelete(id: number, userId: number): Promise<UpdateResult> {
        return this.postRepository
            .createQueryBuilder()
            .softDelete()
            .from(Post)
            .where({ id, user: { id: userId } })
            .execute();
    }

    /**
     * Permanently delete a post
     * @param id
     * @returns DeleteResult
     */
    permaDelete(id: number): Promise<DeleteResult> {
        return this.postRepository.delete(id);
    }

    /**
     * Upvote
     * @param {"user":id,"post":id,"vote":VOTE}
     * @returns Upvote entity
     */
    vote(data: any): Promise<Vote> {
        return this.voteRepository.save(data);
    }

    /**
     * Remove Upvote
     * @param {"user":id,"post":id}
     * @returns UpdateResult
     */
    removeVote(data: any): Promise<DeleteResult> {
        return this.voteRepository.delete(data);
    }

    /**
     * Get total vote count
     * @param postid
     * @returns UpdateResult
     */
    getVoteSum(id: number): Promise<any> {
        return this.voteRepository
            .createQueryBuilder("vote")
            .select("SUM(vote.vote)", "sum")
            .where("vote.post.id = :id", { id })
            .getRawOne();
    }

    /**
     * Comment
     * @param Comment data
     * @returns Comment Entity
     */
    async comment(data: DeepPartial<Comment>): Promise<Comment> {
        if (data.mediaUrl !== null && data.mediaUrl !== undefined) {
            // const data1: Comment = await this.generateCommentMeta(data);
            return this.commentRepository.save(data);
        } else {
            return this.commentRepository.save(data);
        }
    }

    /**
     * All Comments on a post
     * @param id of post
     * @returns all comments
     */
    getAllcomment(id: number): Promise<Comment[]> {
        return this.commentRepository
            .createQueryBuilder("comment")
            .innerJoin("comment.user", "user")
            .addSelect(["user.id", "user.username", "user.avatarUrl"])
            .where({ post: { id }, isDeleted: null })
            .getMany();
    }

    /**
     * All Comments on a post
     * @param postId of post
     * @returns all comments
     */
    getAllCommentsWithVotes(postId: number, userId: number): Promise<CommentWithUserVote[]> {
        return this.postRepository.query(
            `SELECT oc.*, users.username, users.avatarUrl, 
            (SELECT vote FROM cvotes WHERE cvotes.userId =? AND cvotes.commentId = oc.id) as vote,
            (
                SELECT SUM(vote) FROM cvotes 
                INNER JOIN comments ON comments.id = cvotes.commentId
				WHERE comments.id = oc.Id
            ) AS voteSum
            FROM comments oc
            JOIN users ON users.id = oc.userId 
            WHERE oc.postId =? AND oc.deletedAt IS NULL;`,
            [userId, postId]
        );
    }
}
