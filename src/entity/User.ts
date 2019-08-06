import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Post } from "./Post";
import { Comment } from "./Comment";
import { Like } from "./Like";

@Entity()
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
    imgUrl: string;

    @Column({ length: 50, nullable: true })
    firstName: string;

    @Column({ length: 50, nullable: true })
    lastName: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @Column({ length: 30, nullable: true })
    lastIP: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()" })
    lastOnline: Date;

    @Column({ type: "date" })
    dob: Date;

    @Column({ length: 30, nullable: true })
    country: string;

    @OneToMany(type => Post, post => post.owner)
    posts: Post[];

    @OneToMany(type => Comment, comm => comm.owner)
    comments: Comment[];

    @OneToMany(type => Like, like => like.owner)
    likes: Like[];
}
