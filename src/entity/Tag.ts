import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Post } from "./Post";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 30 })
    tagText: string;

    @ManyToMany(type => Post, post => post.tags)
    posts: Post[];
}
