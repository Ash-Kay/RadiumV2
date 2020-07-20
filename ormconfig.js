// eslint-disable-next-line no-undef
module.exports = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "ashish",
    password: "ashish",
    database: "testdb",
    synchronize: true,
    logging: ["error"],
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
    },
};
