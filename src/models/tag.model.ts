import { Post } from "../entity/post.entity";

export default interface Tag {
    id: number;
    tagText: string;
    createdAt: Date;
    deletedAt: Date;
    posts: Post[];
}
