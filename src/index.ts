import "reflect-metadata";
import { handle } from "./handler";
import helmet from "helmet";
import errorhandler from "errorhandler";
import fs from "fs";

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";

import config, { verifyConfig } from "./config/env.config";
import { error } from "./middleware/error";
import kleur from "kleur";
import logger, { LoggerStream } from "./utils/logger";

import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import commRouter from "./routes/comment.route";

import { createConnection } from "typeorm";
import passport from "passport";
const app = express();

verifyConfig(config);

createConnection().then(() => {
    app.use(passport.initialize({ userProperty: "token" }));
    app.use(handle.limit);
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan("dev", { stream: new LoggerStream() }));
    app.use("/uploads", express.static("uploads"));
    app.use("/test", express.static("test"));

    if (config.env === "development") {
        const uploadDir = "./uploads";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        app.use(errorhandler());
    }
    const baseUrl = config.baseURl;

    //Routes
    app.use(baseUrl + "/users", userRouter);
    app.use(baseUrl + "/posts", postRouter);
    app.use(baseUrl + "/comments", commRouter);
    app.use(error);

    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    app.listen(config.port, () => {
        console.log(`\n\n\n
        ${kleur.magenta(app.get("env").toUpperCase())}  
        
        ${kleur.magenta(`API       → http://localhost:${config.port + baseUrl}`)}
        `);

        logger.info(`${app.get("env").toUpperCase()} server started at http://localhost:${config.port + baseUrl}`);
    });
});

export default app;
