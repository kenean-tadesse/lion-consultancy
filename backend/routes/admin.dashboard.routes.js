"use strict";

const express = require("express");

const {
    getDashboardStats
} = require("../controllers/admin.dashboard.controller");

const {
    requireAdmin
} = require("../middleware/auth");

const router = express.Router();

/*
=========================================================
ALL DASHBOARD ROUTES REQUIRE ADMIN AUTHENTICATION
=========================================================
*/

router.use(requireAdmin);

/*
GET /api/admin/dashboard
*/

router.get("/", getDashboardStats);

module.exports = router;