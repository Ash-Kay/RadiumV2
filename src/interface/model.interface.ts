import { Role } from "./role.enum";

export interface UserToken {
    email: string;
    id: number;
    role: Role;
    username: string;
}
