import { Tag } from "../entity/tag.entity";
import { Post } from "../entity/post.entity";
import { getRepository, Repository } from "typeorm";
import logger from "../utils/logger";

export class TagService {
    tagRepository: Repository<Tag>;

    constructor() {
        this.tagRepository = getRepository(Tag);
    }

    /**
     * Insert Tag into database
     */
    async insert(data: Tag): Promise<Tag> {
        const newTag = this.tagRepository.create(data);
        logger.info(`CREATED tag ${data.tagText}`, data);
        return await this.tagRepository.save(newTag);
    }

    /**
     * Find Tag by tag_text
     */
    async getByText(tagText: String): Promise<Tag | undefined> {
        const tag: Tag = await this.tagRepository.findOne({
            where: { tag_text: tagText },
        });

        if (tag) {
            return tag;
        } else {
            return undefined;
        }
    }

    /**
     * Link Post and Tag together
     */
    linkPost(tag: Tag, post: Post): void {
        logger.info(`Linked tag ${tag.id} with post ${post.id}`);
        this.tagRepository.createQueryBuilder().relation(Tag, "posts").of(tag).add(post);
    }
}
