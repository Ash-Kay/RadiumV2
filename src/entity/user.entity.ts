import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    DeleteDateColumn,
} from "typeorm";

import { Post } from "./post.entity";
import { Comment } from "./comment.entity";
import { Like } from "./like.entity";
import { Role } from "../interface/role.enum";

@Entity("users")
@Unique(["username"])
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ nullable: true })
    googleId: string;

    @Column({ length: 30 })
    username: string;

    @Column({ length: 100 })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ length: 50, nullable: true })
    firsName: string;

    @Column({ length: 50, nullable: true })
    lastName: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @Column({ length: 30, nullable: true })
    lastIp: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()" })
    lastOnline: Date;

    @Column({ type: "date", nullable: true })
    dob: Date;

    @Column({ type: "enum", enum: Role, default: Role.USER })
    role: Role;

    @Column({ length: 30, nullable: true })
    country: string;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.user)
    likes: Like[];
}
