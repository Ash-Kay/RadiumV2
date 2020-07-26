import { Entity, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, Column } from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import { VoteState } from "../interface/db.enum";

@Entity("cvotes")
export class CVote {
    @ManyToOne(() => User, (user) => user.votes, { primary: true, nullable: false })
    user: User;

    @ManyToOne(() => Comment, (comment) => comment.vote, { primary: true, nullable: false })
    comment: Comment;

    @Column({ type: "enum", enum: VoteState })
    vote: VoteState;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
