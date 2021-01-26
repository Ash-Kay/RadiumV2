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
    DeleteDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import { Vote } from "./vote.entity";
import { Tag } from "./tag.entity";
import IPost from "../models/post.model";

@Entity("posts")
export class Post implements IPost {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column()
    mediaUrl: string;

    @Column({ default: false })
    sensitive: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.posts, { nullable: false, onDelete: "CASCADE" })
    user: User;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany(() => Vote, (vote) => vote.post)
    vote: Vote[];

    @ManyToMany(() => Tag, (tags) => tags.posts, {
        cascade: ["insert", "update"],
    })
    @JoinTable({ name: "post_tag" })
    tags: Tag[];

    @Column()
    mime: string;
}
