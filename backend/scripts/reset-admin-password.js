"use strict";

require("dotenv").config();

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const resetAdminPassword = async () => {
    try {
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env"
            );
        }

        if (password.length < 8) {
            throw new Error(
                "Admin password must contain at least 8 characters."
            );
        }

        const [admins] = await pool.execute(
            `
            SELECT id, email
            FROM admins
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        if (admins.length === 0) {
            throw new Error(`No admin found with email: ${email}`);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.execute(
            `
            UPDATE admins
            SET password_hash = ?,
                is_active = TRUE
            WHERE email = ?
            `,
            [passwordHash, email]
        );

        console.log("");
        console.log("==========================================");
        console.log("       ADMIN PASSWORD RESET SUCCESS");
        console.log("==========================================");
        console.log(`Admin ID : ${admins[0].id}`);
        console.log(`Email    : ${admins[0].email}`);
        console.log("Status   : Active");
        console.log("==========================================");
        console.log("");

    } catch (error) {
        console.error("");
        console.error("ADMIN PASSWORD RESET FAILED");
        console.error(error.message);
        console.error("");
    } finally {
        await pool.end();
    }
};

resetAdminPassword();