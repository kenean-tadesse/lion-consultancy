/* =========================================================
   LION CONSULTANCY
   ADMIN AUTHENTICATION MIDDLEWARE
   ========================================================= */

"use strict";

const jwt = require("jsonwebtoken");


/* =========================================================
   VERIFY ADMIN AUTHENTICATION
   ========================================================= */

const requireAdmin = (req, res, next) => {

    try {

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is missing from environment."
            );

            return res.status(500).json({
                success: false,
                message:
                    "Authentication service is not configured."
            });
        }


        /*
         * Professional approach:
         *
         * 1. Prefer HTTP-only cookie.
         * 2. Also support Authorization Bearer token
         *    for API/testing purposes.
         */

        let token =
            req.cookies &&
            req.cookies.lion_admin_token;


        /* ---------------------------------------------
           FALLBACK: AUTHORIZATION HEADER
        --------------------------------------------- */

        if (!token) {

            const authorization =
                req.headers.authorization;


            if (
                authorization &&
                authorization.startsWith(
                    "Bearer "
                )
            ) {

                token =
                    authorization.substring(7);
            }
        }


        /* ---------------------------------------------
           TOKEN REQUIRED
        --------------------------------------------- */

        if (!token) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }


        /* ---------------------------------------------
           VERIFY TOKEN
        --------------------------------------------- */

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        /* ---------------------------------------------
           VERIFY ADMIN ID
        --------------------------------------------- */

        if (!decoded.adminId) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token."
            });
        }


        /* ---------------------------------------------
           ATTACH ADMIN TO REQUEST
        --------------------------------------------- */

        req.admin = {
            id: decoded.adminId,
            role: decoded.role
        };


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication token has expired."
            });
        }


        return res.status(401).json({
            success: false,
            message:
                "Invalid authentication token."
        });

    }

};


/* =========================================================
   REQUIRE SUPER ADMIN
   ========================================================= */

const requireSuperAdmin = (
    req,
    res,
    next
) => {

    if (
        !req.admin ||
        req.admin.role !== "super_admin"
    ) {

        return res.status(403).json({
            success: false,
            message:
                "Super administrator access required."
        });
    }


    next();
};


module.exports = {
    requireAdmin,
    requireSuperAdmin
};