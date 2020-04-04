import { Post } from "../entity/post.entity";
import { getRepository, Repository } from "typeorm";
import logger from "../utils/logger";

export class PostService {
    postRepository: Repository<Post>;

    constructor() {
        this.postRepository = getRepository(Post);
    }

    async insert(data: Post): Promise<Post> {
        const newPost = this.postRepository.create(data);
        logger.info(`${data.user.id} CREATED post with id ${data.id}`, data);
        return await this.postRepository.save(newPost);
    }
}
