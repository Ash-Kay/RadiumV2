import "express-async-errors";
import * as express from "express";
import * as bodyParser from "body-parser";
import { config } from "dotenv";
import userRouter from "./routes/user";
import postRouter from "./routes/post";
import commRouter from "./routes/comments";
import * as morgan from "morgan";
import { error } from "./middleware/error";

process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
config();
const baseUrl = process.env.BASE_URL;

app.use(baseUrl + "/users", userRouter);
app.use(baseUrl + "/posts", postRouter);
app.use(baseUrl + "/comments", commRouter);
app.use(error);

app.listen(process.env.PORT || 3000, () => {
    console.log(`\n\n\n\n\nSERVER STARTED ON PORT:${process.env.PORT || 3000}.\n`);
});
