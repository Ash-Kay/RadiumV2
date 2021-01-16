module.exports = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DBNAME,
    synchronize: true,
    logging: true,
    entities: ["./src/entity/**/*{.ts,.js}"],
    migrations: ["./src/migration/**/*{.ts,.js}"],
    subscribers: ["./src/subscriber/**/*{.ts,.js}"],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
    },
};
