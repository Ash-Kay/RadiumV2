import { Post } from "../entity/post.entity";
import { Like } from "../entity/like.entity";
import { Comment } from "../entity/comment.entity";
import { getRepository, Repository, UpdateResult, DeleteResult, SelectQueryBuilder } from "typeorm";
import { SoftDeleteQueryBuilder } from "typeorm/query-builder/SoftDeleteQueryBuilder";

export class PostService {
    postRepository: Repository<Post>;
    likeRepository: Repository<Like>;
    commentRepository: Repository<Comment>;

    constructor() {
        this.postRepository = getRepository(Post);
        this.likeRepository = getRepository(Like);
        this.commentRepository = getRepository(Comment);
    }

    /**
     * Insert Post into database
     * @param Post data
     * @returns Post entity
     */
    create(data: Post): Promise<Post> {
        return this.postRepository.save(data);
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
    find(id: number): Promise<Post> {
        return this.postRepository.findOne(id);
    }

    /**
     * Return posts (includes soft deleted)
     * @param id
     * @returns post
     */
    findWithSoftDeleted(id: number): Promise<Post> {
        return this.postRepository.findOne(id, { withDeleted: true });
    }

    /**
     * Return posts with user inside
     * @param id
     * @returns post with user inside
     */
    findAndLoadUser(id: number): Promise<Post> {
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
}
