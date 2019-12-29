export default interface Post {
    id: number;
    title: string;
    file_path: string;
    created_at: Date;
    updated_at: Date;
    user_id: number;
}
