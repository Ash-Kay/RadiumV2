import { handle } from "./handler";
import "express-async-errors";

import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as cors from "cors";

import { config } from "dotenv";
import { error } from "./middleware/error";
import chalk from "chalk";

import userRouter from "./routes/user";
import postRouter from "./routes/post";
import commRouter from "./routes/comments";
import factRouter from "./routes/fact";

config();
const app = express();
app.use(handle.limit);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
const baseUrl = process.env.BASE_URL;

app.use(baseUrl + "/users", userRouter);
app.use(baseUrl + "/posts", postRouter);
app.use(baseUrl + "/comments", commRouter);
app.use(baseUrl + "/facts", factRouter);
app.use(error);

app.listen(process.env.PORT || 3000, () => {
    //throw new Error();
    console.log(
        chalk.rgb(121, 0, 214)(`
    ${app.get("env").toUpperCase()}  
    API       → http://localhost:${process.env.PORT}/api/v1

    `)
    );
});
