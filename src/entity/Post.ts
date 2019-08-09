import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { Tag } from "./Tag";

@Entity("posts")
export class Post {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column({ length: 300 })
    imgUrl: string;

    @Column({ default: false })
    sensitive: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => User, owner => owner.posts, { nullable: false, onDelete: "CASCADE" })
    owner: User;

    @OneToMany(type => Comment, comm => comm.post)
    comments: Comment[];

    @OneToMany(type => Like, like => like.post)
    likes: Like[];

    @ManyToMany(type => Tag, tag => tag.posts)
    @JoinTable({ name: "posts_tags" })
    tags: Tag[];
}
