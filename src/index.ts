import "reflect-metadata";

import fs from "fs";
import cors from "cors";
import kleur from "kleur";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import passport from "passport";
import { handle } from "./handler";
import bodyParser from "body-parser";
import compression from "compression";
import errorhandler from "errorhandler";
import { createConnection } from "typeorm";

import { error } from "./middleware/error";
import ormConfig from "./config/ormconfig";
import logger, { LoggerStream } from "./utils/logger";
import config, { verifyConfig } from "./config/env.config";

//Routes
import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import commRouter from "./routes/comment.route";

const app = express();

verifyConfig(config);

createConnection(ormConfig);

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

export default app;
