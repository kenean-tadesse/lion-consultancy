"use strict";

const express = require("express");

const {
    createApplication,
    getApplicationById
} = require("../controllers/application.controller");

const router = express.Router();


/* =========================================================
   CREATE APPLICATION
   POST /api/applications
   ========================================================= */

router.post(
    "/",
    createApplication
);


/* =========================================================
   GET APPLICATION BY ID
   GET /api/applications/:id
   ========================================================= */

router.get(
    "/:id",
    getApplicationById
);


module.exports = router;