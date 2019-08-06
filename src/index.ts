import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { validate } from "./validator/validator";
import { config } from "dotenv";

/* process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
}); */

config();
const baseUrl = process.env.BASE_URL;

createConnection()
    .then(async connection => {
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        Routes.forEach(route => {
            (app as any)[route.method](
                baseUrl + route.route,
                validate(route.validationSchema),
                (req: Request, res: Response, next: Function) => {
                    const result = new (route.controller as any)()[route.action](req, res, next);
                    if (result instanceof Promise) {
                        result.then(result => (result !== null && result !== undefined ? res.send(result) : undefined));
                    } else if (result !== null && result !== undefined) {
                        res.json(result);
                    }
                }
            );
        });

        app.listen(process.env.PORT || 3000, () => {
            console.log(`\n\n\n\n\nSERVER STARTED ON PORT:${process.env.PORT || 3000}.\n`);
        });
    })
    .catch(error => console.log(error));
