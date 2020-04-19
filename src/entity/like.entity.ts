import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";

@Entity("likes")
export class Like {
    @ManyToOne((type) => User, (user) => user.likes, { primary: true, nullable: false })
    user: User;

    @ManyToOne((type) => Post, (post) => post.likes, { primary: true, nullable: false })
    post: Post;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
