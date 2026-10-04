/* =========================================================
   LION CONSULTANCY
   ADMIN AUTHENTICATION CONTROLLER
   ========================================================= */

"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

const loginAdmin = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });

        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        /* ---------------------------------------------
           FIND ADMIN
        --------------------------------------------- */

        const [admins] =
            await pool.execute(
                `
                SELECT
                    id,
                    full_name,
                    email,
                    password_hash,
                    role,
                    is_active
                FROM admins
                WHERE email = ?
                LIMIT 1
                `,
                [normalizedEmail]
            );


        /*
         * Do not reveal whether the email
         * exists or not.
         */

        if (admins.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        const admin = admins[0];


        /* ---------------------------------------------
           CHECK ACTIVE STATUS
        --------------------------------------------- */

        if (!admin.is_active) {

            return res.status(403).json({
                success: false,
                message: "This admin account is inactive."
            });

        }


        /* ---------------------------------------------
           VERIFY PASSWORD
        --------------------------------------------- */

        const passwordMatches =
            await bcrypt.compare(
                password,
                admin.password_hash
            );


        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        /* ---------------------------------------------
           JWT SECRET CHECK
        --------------------------------------------- */

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is missing from .env"
            );

            return res.status(500).json({
                success: false,
                message: "Authentication service is not configured."
            });

        }


        /* ---------------------------------------------
           CREATE JWT
        --------------------------------------------- */

        const token =
            jwt.sign(
                {
                    adminId: admin.id,
                    role: admin.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN ||
                        "8h"
                }
            );


        /* ---------------------------------------------
           RESPONSE
        --------------------------------------------- */

     /* =====================================================
   SECURE HTTP-ONLY AUTHENTICATION COOKIE
   ===================================================== */

res.cookie(
    "lion_admin_token",
    token,
    {
        httpOnly: true,

        secure:
            process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "strict"
                : "lax",

        maxAge:
            8 * 60 * 60 * 1000,

        path: "/"
    }
);


/* =====================================================
   LOGIN RESPONSE
   ===================================================== */

return res.status(200).json({

    success: true,

    message:
        "Admin login successful.",

    admin: {
        id: admin.id,

        fullName:
            admin.full_name,

        email:
            admin.email,

        role:
            admin.role
    }

});

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Unable to login."
        });

    }

};


/* =========================================================
   CREATE ADMIN
   ========================================================= */

const createAdmin = async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            role
        } = req.body;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (
            !fullName ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Full name, email and password are required."
            });

        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters."
            });

        }


        /* ---------------------------------------------
           CHECK EXISTING ADMIN
        --------------------------------------------- */

        const [existingAdmins] =
            await pool.execute(
                `
                SELECT id
                FROM admins
                WHERE email = ?
                LIMIT 1
                `,
                [normalizedEmail]
            );


        if (existingAdmins.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "An admin with this email already exists."
            });

        }


        /* ---------------------------------------------
           HASH PASSWORD
        --------------------------------------------- */

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const adminRole =
            role === "super_admin"
                ? "super_admin"
                : "admin";


        /* ---------------------------------------------
           INSERT ADMIN
        --------------------------------------------- */

        const [result] =
            await pool.execute(
                `
                INSERT INTO admins (
                    full_name,
                    email,
                    password_hash,
                    role
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    String(fullName).trim(),
                    normalizedEmail,
                    passwordHash,
                    adminRole
                ]
            );


        return res.status(201).json({

            success: true,

            message:
                "Admin account created successfully.",

            admin: {
                id: result.insertId,
                fullName:
                    String(fullName).trim(),
                email: normalizedEmail,
                role: adminRole
            }

        });

    } catch (error) {

        console.error(
            "Create admin error:",
            error
        );


        if (
            error.code === "ER_DUP_ENTRY"
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "An admin with this email already exists."
            });

        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to create admin account."
        });

    }

};


module.exports = {
    loginAdmin,
    createAdmin
};