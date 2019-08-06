import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Like {
    @ManyToOne(type => User, owner => owner.likes, { primary: true })
    owner: User;

    @ManyToOne(type => Post, post => post.likes, { primary: true })
    onPost: Post;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
