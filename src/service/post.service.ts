import { config } from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime/lite";
config();
import { Post } from "../entity/post.entity";
import { Vote } from "../entity/vote.entity";
import { Comment } from "../entity/comment.entity";
import { getRepository, Repository, UpdateResult, DeleteResult } from "typeorm";
import { RecursivePartial } from "../interface/utilsTypes";
import { PostWithUserVote } from "../interface/model.interface";

export class PostService {
    postRepository: Repository<Post>;
    voteRepository: Repository<Vote>;
    commentRepository: Repository<Comment>;

    constructor() {
        this.postRepository = getRepository(Post);
        this.voteRepository = getRepository(Vote);
        this.commentRepository = getRepository(Comment);

        ffmpeg.setFfprobePath(process.env.FF_PATH);
    }

    /**
     * Insert Post into database
     * @param Post data
     * @returns Post entity
     */
    async create(data: RecursivePartial<Post>): Promise<Post> {
        const data1: Post = await this.generatePostMeta(data as Post);
        return this.postRepository.save(data1);
    }

    /**
     * Fetches posts
     * @returns List of Postss
     */
    getFeed(skip: number, take: number): Promise<Post[]> {
        return this.postRepository
            .createQueryBuilder("post")
            .orderBy("post.createdAt", "DESC")
            .skip(skip)
            .take(take)
            .innerJoin("post.user", "user")
            .addSelect(["user.id", "user.username", "user.avatarUrl"])
            .getMany();
    }

    /**
     * Fetches posts and also add isUp/Downvoted parameter
     * @returns List of Posts
     */
    getFeedWithVotes(userId: number, skip: number, take: number): Promise<PostWithUserVote[]> {
        return this.postRepository.query(
            `
        SELECT op.*, users.username, users.avatarUrl, (
            SELECT vote FROM votes
            INNER JOIN users ON users.id = votes.userId
            INNER JOIN posts ON posts.id = votes.postId
            WHERE users.id =? AND posts.id = op.id
        ) AS vote 
        FROM posts op
        INNER JOIN users ON users.id = op.userId
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
     * Return posts with user inside
     * @param id
     * @returns post with user inside
     */
    findAndLoadUser(id: number): Promise<Post | undefined> {
        return this.postRepository
            .createQueryBuilder("post")
            .where("post.id = :id", { id })
            .innerJoin("post.user", "user")
            .addSelect(["user.id", "user.username", "user.avatarUrl"])
            .getOne();
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
    vote(data: object): Promise<Vote> {
        return this.voteRepository.save(data);
    }

    /**
     * Remove Upvote
     * @param {"user":id,"post":id}
     * @returns UpdateResult
     */
    removeVote(data: object): Promise<DeleteResult> {
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
    comment(data: RecursivePartial<Comment>): Promise<Comment> {
        return this.commentRepository.save(data as Comment);
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
            .where({ post: { id } })
            .getMany();
    }

    /**
     * Adds metadata to postfeed before saving
     * @param post
     * @returns post with metadata
     */
    generatePostMeta(post: Post): Promise<Post> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(post.mediaUrl, function (err, metadata) {
                if (err) {
                    reject(err);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    post.width = metadata.streams[0].width!;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    post.height = metadata.streams[0].height!;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    post.aspectRatio = metadata.streams[0].display_aspect_ratio!;
                    post.mime = mime.getType(post.mediaUrl);
                }
                resolve(post);
            });
        });
    }
}
