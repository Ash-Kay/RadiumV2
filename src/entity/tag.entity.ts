import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, Unique } from "typeorm";
import { Post } from "./post.entity";

@Entity("tags")
@Unique(["tag_text"])
export class Tag {
    constructor() {}

    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 30 })
    tag_text: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @ManyToMany((type) => Post, (post) => post.tags, { nullable: false, cascade: true })
    posts: Post[];
}
