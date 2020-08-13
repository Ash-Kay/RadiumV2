import { Entity, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, Column } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";
import IVote from "../models/vote.model";

@Entity("votes")
export class Vote implements IVote {
    @ManyToOne(() => User, (user) => user.votes, { primary: true, nullable: false })
    user: User;

    @ManyToOne(() => Post, (post) => post.vote, { primary: true, nullable: false })
    post: Post;

    @Column({ type: "tinyint", width: 1 })
    vote: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
