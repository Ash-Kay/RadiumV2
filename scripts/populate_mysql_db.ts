import { createConnection } from "typeorm";
import { User } from "../src/entity/user.entity";
import { Post } from "../src/entity/post.entity";
import { Tag } from "../src/entity/tag.entity";
import { Vote } from "../src/entity/vote.entity";
import { CVote } from "../src/entity/cvote.entity";
import { Comment } from "../src/entity/comment.entity";
import faker from "faker";
import kleur from "kleur";
import ormConfig from "../src/config/ormconfig";

//visible at: http://localhost:3000/test/file/img.jpg
const filePath = "http://localhost:3000/test/file/img.jpg";

createConnection(ormConfig).then(async (connection) => {
    try {
        //Create 20 Users
        for (let i = 1; i <= 20; i++) {
            const user = new User();
            user.username = faker.internet.userName();
            if (Math.random() < 0.5) user.firsName = faker.name.findName();
            if (Math.random() < 0.5) user.lastName = faker.name.lastName();
            user.email = `a@k${i}.com`;
            user.password = `12345`;
            if (Math.random() < 0.5) user.avatarUrl = faker.image.avatar();
            if (Math.random() < 0.5) user.dob = faker.date.past();
            if (Math.random() < 0.5) user.country = faker.address.country();
            await connection.manager.save(user);
        }

        //Create 20 Posts
        for (let i = 1; i <= 20; i++) {
            const post = new Post();
            post.title = faker.lorem.sentence(5);
            post.mediaUrl = filePath;
            post.mime = "image/jpeg";
            post.sensitive = Math.random() < 0.25 ? true : false;
            post.user = {
                id: Math.floor(Math.random() * 20) + 1,
            } as User;
            await connection.manager.save(post);
        }

        //Create Tags
        for (let i = 1; i <= 20; i++) {
            if (Math.random() < 0.2) continue;
            const tag = new Tag();
            tag.tagText = faker.random.word() + i;
            await connection.manager.save(tag);
            await connection.createQueryBuilder().relation(Tag, "posts").of(tag).add({ id: i });
        }

        //Create Votes
        for (let i = 1; i <= 20; i++) {
            if (Math.random() < 0.2) continue;
            const vote = new Vote();
            vote.vote = Math.random() < 0.5 ? 1 : -1;
            vote.post = { id: i } as Post;
            vote.user = { id: i } as User;
            await connection.manager.save(vote);
        }

        //Create Comments
        for (let i = 1; i <= 20; i++) {
            const comment = new Comment();
            comment.message = faker.lorem.words(Math.floor(Math.random() * 20) + 1);
            if (Math.random() < 0.3) comment.mediaUrl = filePath;
            comment.mime = "image/jpeg";
            comment.post = { id: i } as Post;
            comment.user = { id: i } as User;
            await connection.manager.save(comment);
        }

        //Create CVotes
        for (let i = 1; i <= 20; i++) {
            const vote = new CVote();
            vote.vote = Math.random() < 0.5 ? 1 : -1;
            vote.comment = { id: i } as Comment;
            vote.user = { id: i } as User;
            await connection.manager.save(vote);
        }

        console.log(`${kleur.bold().green("SUCCESS!")}`);
        connection.close();
        process.exit();
    } catch (error) {
        console.log(`${kleur.bold().red("SOMETHING WENT WRONG!")}`);
        connection.close();
        process.exit();
    }
});
