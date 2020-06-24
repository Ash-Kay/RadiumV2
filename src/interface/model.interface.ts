import { Role } from "./role.enum";

export interface UserToken {
    email: string;
    id: number;
    googleId: string;
    role: Role;
    username: string;
}
