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

@Entity()
export class Post {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ length: 100 })
    username: string;

    @Column({ length: 300 })
    imgUrl: string;

    @Column()
    sensitive: boolean;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => User, owner => owner.posts)
    owner: User;

    @OneToMany(type => Comment, comm => comm.onPost)
    comments: Comment[];

    @OneToMany(type => Like, like => like.onPost)
    likes: Like[];

    @ManyToMany(type => Tag, tag => tag.posts)
    @JoinTable()
    tags: Tag[];
}
