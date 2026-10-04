"use strict";

const express = require("express");

const {
    getApplications,
    getApplication,
    updateApplicationStatus,
    getApplicationHistory,
    convertApplicationToStudent
} = require("../controllers/admin.application.controller");

const {
    requireAdmin
} = require("../middleware/auth");

const router = express.Router();


/* =========================================================
   ADMIN AUTHENTICATION
   ========================================================= */

router.use(requireAdmin);


/* =========================================================
   APPLICATION LIST
   GET /api/admin/applications
   ========================================================= */

router.get(
    "/",
    getApplications
);


/* =========================================================
   APPLICATION STATUS HISTORY
   IMPORTANT:
   This MUST come before /:id
   ========================================================= */

router.get(
    "/:id/history",
    getApplicationHistory
);

router.post("/:id/convert-to-student", convertApplicationToStudent);
/* =========================================================
   SINGLE APPLICATION
   GET /api/admin/applications/:id
   ========================================================= */

router.get(
    "/:id",
    getApplication
);


/* =========================================================
   UPDATE APPLICATION STATUS
   PATCH /api/admin/applications/:id/status
   ========================================================= */

router.patch(
    "/:id/status",
    updateApplicationStatus
);


module.exports = router;