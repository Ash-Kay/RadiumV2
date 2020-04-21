import { Entity, CreateDateColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";

@Entity("likes")
export class Like {
    @ManyToOne(() => User, (user) => user.likes, { primary: true, nullable: false })
    user: User;

    @ManyToOne(() => Post, (post) => post.likes, { primary: true, nullable: false })
    post: Post;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
}
