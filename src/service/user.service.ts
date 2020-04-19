import { User } from "../entity/user.entity";
import { getRepository, Repository } from "typeorm";

export class UserService {
    userRepository: Repository<User>;

    constructor() {
        this.userRepository = getRepository(User);
    }

    /**
     * Insert Post into database
     */
    all(): Promise<User[]> {
        return this.userRepository.find();
    }

    /**
     * Insert Post into database
     * @param User
     * @returns Created User
     */
    create(data: User): Promise<User> {
        return this.userRepository.save(data);
    }

    /**
     * Find user by email
     * @param email
     * @returns Found User
     */
    findByEmail(email: string): Promise<User> {
        return this.userRepository.findOneOrFail({
            where: { email },
        });
    }

    /**
     * Find user by ID
     * @param id
     * @returns Found User
     */
    findById(id: number): Promise<User> {
        return this.userRepository.findOneOrFail(id);
    }

    /**
     * Update user by finding with ID
     * @param id
     * @returns userDetails
     * @returns Updated User
     */
    update(id: number, data: User): void {
        this.userRepository.update(id, data);
    }

    /**
     * Return all posts from the given user
     * @param id
     * @returns PostList
     */
    getPosts(id: number): Promise<User> {
        return this.userRepository.findOne(id, { relations: ["posts"] });
    }
}
