import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, Unique } from "typeorm";
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

    @ManyToMany((type) => Post, (post) => post.tags, { nullable: false, cascade: true })
    posts: Post[];
}
