import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    DeleteDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
import { Like } from "./like.entity";
import { Tag } from "./tag.entity";

@Entity("posts")
export class Post {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 50 })
    title: string;

    @Column()
    mediaUrl: string;

    @Column({ default: false })
    sensitive: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.posts, { nullable: false, onDelete: "CASCADE" })
    user: User;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];

    @ManyToMany(() => Tag, (tags) => tags.posts, {
        cascade: ["insert", "update"],
    })
    @JoinTable({ name: "post_tag" })
    tags: Tag[];

    @Column({ unsigned: true })
    width: number;

    @Column({ unsigned: true })
    height: number;

    @Column()
    aspectRatio: string;

    @Column()
    mime: string;
}
