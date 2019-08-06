import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity("likes")
export class Like {
    @ManyToOne(type => User, owner => owner.likes, { primary: true, nullable: false })
    owner: User;

    @ManyToOne(type => Post, post => post.likes, { primary: true, nullable: false })
    post: Post;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
