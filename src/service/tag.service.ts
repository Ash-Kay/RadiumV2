import { Tag } from "../entity/tag.entity";
import { Post } from "../entity/post.entity";
import { DeepPartial, getRepository, Repository } from "typeorm";

export class TagService {
    tagRepository: Repository<Tag>;

    constructor() {
        this.tagRepository = getRepository(Tag);
    }

    /**
     * Insert Tag into database
     * @param tagText tag string
     * @param Post post in which to be insert
     * @returns Created Tag
     */
    async create(tagText: string, post: Post): Promise<Tag> {
        const tag = new Tag();
        tag.tagText = tagText;
        tag.posts = [post];
        return this.tagRepository.save(tag);
    }

    /**
     * Find Tag by tagText
     * @param tagText tag string
     * @returns found Tag Entity
     */
    async getByText(tagText: string): Promise<Tag | undefined> {
        const tag = await this.tagRepository.findOne({
            where: { tagText: tagText },
        });

        if (tag) {
            return tag;
        } else {
            return undefined;
        }
    }

    /**
     * Link Post and Tag together
     * @param Tag entity
     * @param Post entity
     * @returns void
     */
    linkPost(tag: Tag, post: DeepPartial<Post>): void {
        this.tagRepository.createQueryBuilder().relation(Tag, "posts").of(tag).add(post);
    }

    /**
     * Get all tags on a post
     * @param postId of post
     * @returns Tag[]
     */
    getTags(postId: number): Promise<Tag[]> {
        return this.tagRepository.query(
            `SELECT tags.* FROM tags
             LEFT JOIN post_tag ON tags.id = post_tag.tagsId
             WHERE postsId = ?;`,
            [postId]
        );
    }
}
