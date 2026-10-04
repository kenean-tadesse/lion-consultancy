"use strict";

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lion_consultancy",

    ssl: process.env.DB_HOST
        ? {
              rejectUnauthorized: true
          }
        : undefined,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("");
        console.log("==========================================");
        console.log("       MYSQL DATABASE CONNECTED");
        console.log("==========================================");
        console.log(`Host     : ${process.env.DB_HOST || "localhost"}`);
        console.log(`Database : ${process.env.DB_NAME || "lion_consultancy"}`);
        console.log("==========================================");
        console.log("");

        connection.release();

    } catch (error) {
        console.error("");
        console.error("MYSQL DATABASE CONNECTION FAILED");
        console.error(error.message);
        console.error("");

        process.exit(1);
    }
};

module.exports = {
    pool,
    connectDB
};