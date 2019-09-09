import chalk from "chalk";

export const uncaughtException = process.on("uncaughtException", e => {
    console.log(chalk.bgRgb(150, 0, 0)(e.stack));
    process.exit(1);
});

export const unhandledRejection = process.on("unhandledRejection", e => {
    console.log(chalk.bgRgb(150, 0, 0)(e.stack));
    process.exit(1);
});
