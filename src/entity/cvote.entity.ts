import { Entity, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, Column } from "typeorm";

import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import ICVote from "../models/cvote.model";

@Entity("cvotes")
export class CVote implements ICVote {
    @ManyToOne(() => User, (user) => user.votes, { primary: true, nullable: false })
    user: User;

    @ManyToOne(() => Comment, (comment) => comment.vote, { primary: true, nullable: false })
    comment: Comment;

    @Column({ type: "tinyint", width: 1 })
    vote: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
