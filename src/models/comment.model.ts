export default interface Comments {
    id: number;
    message: string;
    tag_to: string;
    img_url: string;
    created_at: Date;
    updated_at: Date;
    post_id: number;
    user_id: number;
}
