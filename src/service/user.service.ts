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
    save(data: User): Promise<User> {
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
}
