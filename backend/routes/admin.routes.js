/* =========================================================
   LION CONSULTANCY
   ADMIN AUTHENTICATION ROUTES
   ========================================================= */

"use strict";

const express = require("express");

const {
    loginAdmin
} = require(
    "../controllers/admin.controller"
);

const {
    requireAdmin
} = require(
    "../middleware/auth"
);


const router =
    express.Router();


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

router.post(
    "/login",
    loginAdmin
);


/* =========================================================
   ADMIN LOGOUT
   ========================================================= */

router.post(
    "/logout",
    (req, res) => {

        res.clearCookie(
            "lion_admin_token",
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    process.env.NODE_ENV ===
                    "production"
                        ? "strict"
                        : "lax",

                path: "/"
            }
        );


        return res.status(200).json({

            success: true,

            message:
                "Admin logged out successfully."

        });

    }
);


/* =========================================================
   CURRENT ADMIN
   ========================================================= */

router.get(
    "/me",
    requireAdmin,
    (req, res) => {

        return res.status(200).json({

            success: true,

            admin: {
                id: req.admin.id,
                role: req.admin.role
            }

        });

    }
);


module.exports = router;