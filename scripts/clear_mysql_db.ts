import { createConnection } from "typeorm";
import kleur from "kleur";
import ormConfig from "../src/config/ormconfig";

createConnection(ormConfig).then(async (connection) => {
    const dbName = process.argv[2];

    if (dbName === undefined || dbName == null || dbName == "") {
        console.log(`${kleur.bold().red("ERR: Please provide DATABASE NAME!")}`);
    } else {
        await connection.query(`DROP DATABASE ${dbName};`);
        await connection.query(`CREATE DATABASE ${dbName};`);
        console.log(`${kleur.bold().green("SUCCESS!")}`);
    }

    connection.close();
    process.exit();
});
