import { User } from "../entity/user.entity";
import { getRepository, Repository, UpdateResult } from "typeorm";

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
    findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    /**
     * Find user by ID
     * @param id
     * @returns Found User
     */
    findById(id: number): Promise<User | undefined> {
        return this.userRepository.findOne(id);
    }

    /**
     * Update user by finding with ID
     * @param id
     * @returns userDetails
     * @returns Updated User
     */
    update(id: number, data: User): Promise<UpdateResult | undefined> {
        return this.userRepository.update(id, data);
    }

    /**
     * Return all posts from the given user
     * @param id
     * @returns User with post inside
     */
    loadUserWithPosts(id: number): Promise<User | undefined> {
        return this.userRepository.findOne(id, { relations: ["posts"] });
    }
}
