import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    DeleteDateColumn,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";

@Entity("comments")
export class Comment {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 1000 })
    message: string;

    @Column({ nullable: true })
    mediaUrl: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @OneToOne(() => User, (user) => user.comments, { nullable: true })
    @JoinColumn()
    tagTo: User;

    @ManyToOne(() => User, (user) => user.comments, { nullable: false, onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Post, (post) => post.comments, { nullable: false, onDelete: "CASCADE" })
    post: Post;
}
