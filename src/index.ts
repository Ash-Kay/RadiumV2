import { handle } from "./handler";
import "express-async-errors";

import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as cors from "cors";

import { config } from "dotenv";
import { error } from "./middleware/error";
import * as kleur from "kleur";
import logger, { LoggerStream } from "./utils/logger";

import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import commRouter from "./routes/comment.route";

config();
const app = express();
app.use(handle.limit);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev", { stream: new LoggerStream() }));
app.use("/uploads", express.static("uploads"));
const baseUrl = process.env.BASE_URL;

app.use(baseUrl + "/users", userRouter);
app.use(baseUrl + "/posts", postRouter);
app.use(baseUrl + "/comments", commRouter);
app.use(error);

app.listen(process.env.PORT || 3000, () => {
    // throw new Error();
    console.log(`\n\n\n
    ${kleur.magenta(app.get("env").toUpperCase())}  
    ${kleur.magenta(`API       → http://localhost:${process.env.PORT + process.env.BASE_URL}`)}
    `);

    logger.info(
        `${app.get("env").toUpperCase()} server started at http://localhost:${process.env.PORT + process.env.BASE_URL}`
    );
});

export default app;
