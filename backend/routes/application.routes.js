"use strict";

const express = require("express");

const {
    createApplication,
    getApplications,
    getApplicationById
} = require("../controllers/application.controller");

const router = express.Router();


/* =========================================================
   GET ALL APPLICATIONS
   GET /api/applications
   ========================================================= */

router.get(
    "/",
    getApplications
);


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