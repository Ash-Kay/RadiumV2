import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    CreateDateColumn,
    Unique,
    DeleteDateColumn,
} from "typeorm";
import { Post } from "./post.entity";

@Entity("tags")
@Unique(["tagText"])
export class Tag {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 30 })
    tagText: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @ManyToMany(() => Post, (post) => post.tags, { nullable: false, cascade: true })
    posts: Post[];
}
