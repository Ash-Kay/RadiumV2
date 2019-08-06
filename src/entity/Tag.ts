import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Post } from "./Post";

@Entity("tags")
export class Tag {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 30 })
    tagText: string;

    @ManyToMany(type => Post, post => post.tags, { nullable: false })
    posts: Post[];
}
