import { config } from "dotenv";
import { EnvConfig } from "../interface/env.interface";
config();

const configObject: EnvConfig = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000"),

    database: {
        host: process.env.DB_HOST || "",
        username: process.env.DB_USER || "",
        password: process.env.DB_PASS || "",
        name: process.env.DB_DBNAME || "",
        logging: process.env.DB_LOGGING || "",
    },

    baseURl: process.env.BASE_URL || "",
    jwtKey: process.env.JWT_KEY || "",

    uploadPath: process.env.UPLOAD_PATH || "",

    ffPath: process.env.FF_PATH || "",

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },

    aws: {
        accessKeyID: process.env.AWS_ACCESS_KEY_ID || "",
        secrectAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        s3BucketName: process.env.AWS_S3_BUCKET_NAME || "",
        s3BaseUrl: process.env.AWS_S3_BASE_URL || "",
        ec2BaseUrl: process.env.AWS_EC2_BASE_URL || "",
    },
};

export const verifyConfig = (configObject: EnvConfig): void => {
    Object.keys(configObject).forEach((key) => {
        if (configObject[key] === undefined || configObject[key] === "") {
            throw new Error(`⚠️  .ENV file have missing value for FIELD: ${key}  ⚠️`);
        } else {
            if (typeof configObject[key] === "object") {
                verifyConfig(configObject[key]);
            }
        }
    });
};

export default configObject;
