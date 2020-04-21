import { Post } from "../entity/post.entity";
import { Like } from "../entity/like.entity";
import { getRepository, Repository, UpdateResult, DeleteResult } from "typeorm";

export class PostService {
    postRepository: Repository<Post>;
    likeRepository: Repository<Like>;

    constructor() {
        this.postRepository = getRepository(Post);
        this.likeRepository = getRepository(Like);
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
    getFeed(): Promise<Post[]> {
        const posts = this.postRepository.find({
            order: {
                createdAt: "DESC",
            },
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
    softDelete(id: number): Promise<UpdateResult> {
        return this.postRepository.softDelete(id);
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
     * @returns
     */
    like(data: Like): Promise<Like> {
        return this.likeRepository.save(data);
    }
}
