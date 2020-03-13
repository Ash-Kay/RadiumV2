import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Unique } from "typeorm";

import { Post } from "./post.entity";
import { Comment } from "./comment.entity";
import { Like } from "./like.entity";

@Entity("users")
@Unique(["username"])
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 30 })
    username: string;

    @Column({ length: 100 })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    img_url: string;

    @Column({ length: 50, nullable: true })
    first_name: string;

    @Column({ length: 50, nullable: true })
    last_name: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @Column({ length: 30, nullable: true })
    last_ip: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()" })
    last_online: Date;

    @Column({ type: "date", nullable: true })
    dob: Date;

    @Column({ length: 30, nullable: true })
    country: string;

    @OneToMany(
        type => Post,
        post => post.user
    )
    posts: Post[];

    @OneToMany(
        type => Comment,
        comment => comment.user
    )
    comments: Comment[];

    @OneToMany(
        type => Like,
        like => like.user
    )
    likes: Like[];
}
