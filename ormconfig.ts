import config from "./src/config/env.config";

module.exports = {
    type: "mysql",
    host: config.database.host,
    port: 3306,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    synchronize: true,
    logging: config.database.logging,
    entities: ["./src/entity/**/*{.ts,.js}"],
    migrations: ["./src/migration/**/*{.ts,.js}"],
    subscribers: ["./src/subscriber/**/*{.ts,.js}"],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
    },
};
