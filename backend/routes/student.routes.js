"use strict";

const express = require("express");

const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent
} = require("../controllers/student.controller");

const {
    requireAdmin
} = require("../middleware/auth");

const router = express.Router();


/* =========================================================
   STUDENT ROUTES
   ========================================================= */

router.use(requireAdmin);


/* GET ALL STUDENTS */

router.get(
    "/",
    getStudents
);


/* CREATE STUDENT */

router.post(
    "/",
    createStudent
);


/* GET SINGLE STUDENT */

router.get(
    "/:id",
    getStudent
);


/* UPDATE STUDENT */

router.patch(
    "/:id",
    updateStudent
);


module.exports = router;
