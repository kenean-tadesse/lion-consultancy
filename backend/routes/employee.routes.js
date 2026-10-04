/* =========================================================
   LION CONSULTANCY
   EMPLOYEE ROUTES
   ========================================================= */

"use strict";

const express = require("express");

const router = express.Router();

/*
   Temporary employee test route.
   We will connect the real employee controller/authentication
   after the server is running correctly.
*/

router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Employee routes are working."
    });
});

module.exports = router;