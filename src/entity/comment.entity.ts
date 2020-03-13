import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";

@Entity("comments")
export class Comment {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 1000 })
    message: string;

    @Column({ nullable: true })
    img_url: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @ManyToOne(
        type => User,
        user => user.comments,
        { nullable: false, onDelete: "CASCADE" }
    )
    user: User;

    @ManyToOne(
        type => Post,
        post => post.comments,
        { nullable: false, onDelete: "CASCADE" }
    )
    post: Post;
}
