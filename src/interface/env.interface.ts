import { LoggerOptions } from "typeorm";

export interface EnvConfig {
    env: string;
    port: number;
    database: Database;
    baseURl: string;
    jwtKey: string;
    uploadPath: string;
    ffPath: string;
    google: Google;
    aws: Aws;
}
interface Database {
    host: string;
    username: string;
    password: string;
    name: string;
    logging: LoggerOptions;
}
interface Google {
    clientId: string;
    clientSecret: string;
}
interface Aws {
    accessKeyID: string;
    secrectAccessKey: string;
    s3BucketName: string;
    s3BaseUrl: string;
    ec2BaseUrl: string;
}
