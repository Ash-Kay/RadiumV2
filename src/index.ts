import "reflect-metadata";
import { handle } from "./handler";
import helmet from "helmet";
import errorhandler from "errorhandler";

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";

import { config } from "dotenv";
import { error } from "./middleware/error";
import kleur from "kleur";
import logger, { LoggerStream } from "./utils/logger";

import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import commRouter from "./routes/comment.route";

import { createConnection } from "typeorm";
config();
const app = express();

createConnection().then(() => {
    app.use(handle.limit);
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan("dev", { stream: new LoggerStream() }));
    app.use("/uploads", express.static("uploads"));
    app.use(errorhandler());

    const baseUrl = process.env.BASE_URL;

    //Routes
    app.use(baseUrl + "/users", userRouter);
    app.use(baseUrl + "/posts", postRouter);
    app.use(baseUrl + "/comments", commRouter);
    app.use(error);

    app.listen(process.env.PORT || 3000, () => {
        console.log(`\n\n\n
        ${kleur.magenta(app.get("env").toUpperCase())}  
        
        ${kleur.magenta(
            `API       → http://localhost:${
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                process.env.PORT! + process.env.BASE_URL
            }`
        )}
        `);

        logger.info(
            `${app.get("env").toUpperCase()} server started at http://localhost:${
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                process.env.PORT! + process.env.BASE_URL
            }`
        );
    });
});

export default app;
