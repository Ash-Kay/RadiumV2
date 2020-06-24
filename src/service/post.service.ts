import { config } from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime/lite";
config();
import { Post } from "../entity/post.entity";
import { Like } from "../entity/like.entity";
import { Comment } from "../entity/comment.entity";
import { getRepository, Repository, UpdateResult, DeleteResult } from "typeorm";

export class PostService {
    postRepository: Repository<Post>;
    likeRepository: Repository<Like>;
    commentRepository: Repository<Comment>;

    constructor() {
        this.postRepository = getRepository(Post);
        this.likeRepository = getRepository(Like);
        this.commentRepository = getRepository(Comment);

        ffmpeg.setFfprobePath(process.env.FF_PATH);
    }

    /**
     * Insert Post into database
     * @param Post data
     * @returns Post entity
     */
    async create(data: Post): Promise<Post> {
        const data1: Post = await this.generatePostMeta(data);
        return this.postRepository.save(data1);
    }

    /**
     * Fetches posts
     * @returns List of Postss
     */
    getFeed(skip: number, take: number): Promise<Post[]> {
        const posts = this.postRepository.find({
            skip,
            take,
            order: {
                createdAt: "DESC",
            },
            relations: ["user"],
        });
        return posts;
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
     * Like
     * @param id
     * @returns Like entity
     */
    like(data: Like): Promise<Like> {
        return this.likeRepository.save(data);
    }

    /**
     * Unlike
     * @param {"user":id,"post":id}
     * @returns UpdateResult
     */
    unlike(id: object): Promise<DeleteResult> {
        return this.likeRepository.delete(id);
    }

    /**
     * Comment
     * @param Comment data
     * @returns Comment Entity
     */
    comment(data: Comment): Promise<Comment> {
        return this.commentRepository.save(data);
    }

    /**
     * All Comments on a post
     * @param id of post
     * @returns all comments
     */
    getAllcomment(id: number): Promise<Comment[]> {
        return this.commentRepository.find({ where: [{ post: { id } }] });
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
