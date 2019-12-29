export default interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    img_url: string;
    first_name: string;
    last_name: string;
    updated_at: Date;
    last_ip: string;
    last_online: Date;
    dob: Date;
    country: string;
    user_type: string;
}
