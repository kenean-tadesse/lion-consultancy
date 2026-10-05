"use strict";

require("dotenv").config();

const mysql = require("mysql2/promise");
const readline = require("readline");

function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    console.log("");
    console.log("==========================================");
    console.log("   LION CONSULTANCY DATABASE MIGRATION");
    console.log("==========================================");
    console.log("");

    const aivenPassword = await ask("Enter Aiven MySQL password: ");

    const local = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "lion_consultancy"
    });

    const aiven = await mysql.createConnection({
        host: "lion-consultancy-keneantadesse730-04fc.b.aivencloud.com",
        port: 26907,
        user: "avnadmin",
        password: aivenPassword,
        database: "defaultdb",
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log("Local database connected.");
    console.log("Aiven database connected.");
    console.log("");

    const [tables] = await local.query("SHOW TABLES");

    const tableKey = `Tables_in_${process.env.DB_NAME || "lion_consultancy"}`;

    console.log(`Found ${tables.length} local tables.`);
    console.log("");

    await aiven.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const row of tables) {
        const tableName = row[tableKey] || Object.values(row)[0];

        console.log(`Migrating table: ${tableName}`);

        const [[createRow]] = await local.query(
            `SHOW CREATE TABLE \`${tableName}\``
        );

        const createSql =
            createRow["Create Table"] ||
            createRow[Object.keys(createRow)[1]];

        await aiven.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        await aiven.query(createSql);

        const [columns] = await local.query(
            `SHOW COLUMNS FROM \`${tableName}\``
        );

        const columnNames = columns.map(column => column.Field);

        const [rows] = await local.query(
            `SELECT * FROM \`${tableName}\``
        );

        if (rows.length > 0) {
            const placeholders = columnNames.map(() => "?").join(", ");

            const insertSql = `
                INSERT INTO \`${tableName}\`
                (${columnNames.map(c => `\`${c}\``).join(", ")})
                VALUES (${placeholders})
            `;

            for (const data of rows) {
                await aiven.query(
                    insertSql,
                    columnNames.map(column => data[column])
                );
            }
        }

        console.log(`  ${rows.length} rows copied.`);
    }

    await aiven.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("");
    console.log("==========================================");
    console.log("       MIGRATION COMPLETED");
    console.log("==========================================");
    console.log("");

    await local.end();
    await aiven.end();
}

main().catch(error => {
    console.error("");
    console.error("MIGRATION FAILED");
    console.error(error);
    process.exit(1);
});