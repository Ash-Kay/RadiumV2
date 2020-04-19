import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import { Like } from "./like.entity";
import { Tag } from "./tag.entity";

@Entity("posts")
export class Post {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 50 })
    title: string;

    @Column()
    mediaUrl: string;

    @Column({ default: false })
    sensitive: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne((type) => User, (user) => user.posts, { nullable: false, onDelete: "CASCADE" })
    user: User;

    @OneToMany((type) => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany((type) => Like, (like) => like.post)
    likes: Like[];

    @ManyToMany((type) => Tag, (tags) => tags.posts, {
        cascade: ["insert", "update"],
    })
    @JoinTable({ name: "post_tag" })
    tags: Tag[];
}
