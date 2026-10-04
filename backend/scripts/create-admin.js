/* =========================================================
   LION CONSULTANCY
   INITIAL ADMIN CREATION SCRIPT
   ========================================================= */

"use strict";

require("dotenv").config();

const bcrypt =
    require("bcryptjs");

const {
    pool
} = require("../config/db");


const createAdmin = async () => {

    try {

        const fullName =
            process.env.ADMIN_NAME;

        const email =
            process.env.ADMIN_EMAIL
                ?.trim()
                .toLowerCase();

        const password =
            process.env.ADMIN_PASSWORD;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (
            !fullName ||
            !email ||
            !password
        ) {

            throw new Error(
                "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env"
            );
        }


        if (password.length < 8) {

            throw new Error(
                "Admin password must contain at least 8 characters."
            );
        }


        /* ---------------------------------------------
           CHECK EXISTING ADMIN
        --------------------------------------------- */

        const [existing] =
            await pool.execute(
                `
                SELECT id
                FROM admins
                WHERE email = ?
                LIMIT 1
                `,
                [email]
            );


        if (existing.length > 0) {

            throw new Error(
                "An admin with this email already exists."
            );
        }


        /* ---------------------------------------------
           HASH PASSWORD
        --------------------------------------------- */

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        /* ---------------------------------------------
           CREATE SUPER ADMIN
        --------------------------------------------- */

        const [result] =
            await pool.execute(
                `
                INSERT INTO admins (
                    full_name,
                    email,
                    password_hash,
                    role,
                    is_active
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    'super_admin',
                    TRUE
                )
                `,
                [
                    fullName.trim(),
                    email,
                    passwordHash
                ]
            );


        console.log("");
        console.log(
            "=========================================="
        );
        console.log(
            "       SUPER ADMIN CREATED"
        );
        console.log(
            "=========================================="
        );
        console.log(
            `ID    : ${result.insertId}`
        );
        console.log(
            `Name  : ${fullName}`
        );
        console.log(
            `Email : ${email}`
        );
        console.log(
            "Role  : super_admin"
        );
        console.log(
            "=========================================="
        );
        console.log("");


    } catch (error) {

        console.error("");
        console.error(
            "ADMIN CREATION FAILED"
        );
        console.error(
            error.message
        );
        console.error("");

        process.exitCode = 1;

    } finally {

        await pool.end();

    }

};


createAdmin();