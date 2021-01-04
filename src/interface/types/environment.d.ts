declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_HOST: string;
            DB_USER: string;
            DB_PASS: string;
            DB_DBNAME: string;
            DB_LOGGING: string | boolean;
            DEBUG: string;
            BASE_URL: string;
            JWT_KEY: string;
            PORT: string;
            NODE_ENV: string;
            UPLOAD_PATH: string;
            JWT_TEST: string;
            FF_PATH: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
        }
    }
}

export {};
