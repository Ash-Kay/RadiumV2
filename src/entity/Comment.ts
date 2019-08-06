import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 1000 })
    message: string;

    @Column({ nullable: true })
    imgUrl: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => User, owner => owner.comments)
    owner: User;

    @ManyToOne(type => Post, post => post.comments)
    onPost: Post;
}
