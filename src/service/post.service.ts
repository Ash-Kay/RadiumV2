import { Post } from "../entity/post.entity";
import { getRepository, Repository } from "typeorm";

export class PostService {
    postRepository: Repository<Post>;

    constructor() {
        this.postRepository = getRepository(Post);
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
     * Return posts with user inside
     * @param id
     * @returns post with user inside
     */
    loadPostWithUser(id: number): Promise<Post> {
        return this.postRepository.findOne(id, { relations: ["user"] });
    }
}
