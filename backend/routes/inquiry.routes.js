/* =========================================================
   LION CONSULTANCY
   PUBLIC CONSULTATION INQUIRY ROUTES
   ========================================================= */

"use strict";

const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

const clean = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const cleaned = String(value).trim();

    return cleaned === "" ? null : cleaned;
};


const allowedPriorities = [
    "urgent",
    "high",
    "normal",
    "low"
];


const allowedStatuses = [
    "new",
    "contacted",
    "consultation",
    "followup",
    "converted",
    "closed"
];


/* =========================================================
   POST /api/inquiries
   CREATE NEW CONSULTATION INQUIRY
   ========================================================= */

router.post("/", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            country,
            destination,
            studyLevel,
            study_level,
            priority,
            status,
            subject,
            message,
            notes,
            assignedTo,
            assigned_to,
            source
        } = req.body;


        /* -----------------------------------------------------
           BASIC VALIDATION
           ----------------------------------------------------- */

        const cleanedName = clean(name);
        const cleanedEmail = clean(email);

        if (!cleanedName) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }


        if (!cleanedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });
        }


        /* -----------------------------------------------------
           EMAIL VALIDATION
           ----------------------------------------------------- */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }


        /* -----------------------------------------------------
           NORMALIZE VALUES
           ----------------------------------------------------- */

        const finalPriority =
            allowedPriorities.includes(priority)
                ? priority
                : "normal";


        const finalStatus =
            allowedStatuses.includes(status)
                ? status
                : "new";


        const finalStudyLevel =
            clean(studyLevel) ||
            clean(study_level);


        const finalAssignedTo =
            clean(assignedTo) ||
            clean(assigned_to);


        const finalSource =
            clean(source) ||
            "website";


        /* -----------------------------------------------------
           INSERT INTO DATABASE
           ----------------------------------------------------- */

        const sql = `
            INSERT INTO consultation_inquiries (
                name,
                email,
                phone,
                country,
                destination,
                study_level,
                priority,
                status,
                subject,
                message,
                notes,
                assigned_to,
                source,
                is_read
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        const values = [
            cleanedName,
            cleanedEmail,
            clean(phone),
            clean(country),
            clean(destination),
            finalStudyLevel,
            finalPriority,
            finalStatus,
            clean(subject),
            clean(message),
            clean(notes),
            finalAssignedTo,
            finalSource,
            0
        ];


        const [result] = await pool.execute(
            sql,
            values
        );


        /* -----------------------------------------------------
           RESPONSE
           ----------------------------------------------------- */

        return res.status(201).json({
            success: true,
            message: "Consultation inquiry submitted successfully.",
            inquiry: {
                id: result.insertId,
                name: cleanedName,
                email: cleanedEmail,
                status: finalStatus,
                priority: finalPriority
            }
        });


    } catch (error) {

        console.error(
            "CREATE INQUIRY ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Unable to submit consultation inquiry."
        });

    }

});


/* =========================================================
   GET /api/inquiries
   PUBLIC INQUIRY LIST
   ---------------------------------------------------------
   This is kept simple for now.
   The secure admin list will be created separately.
   ========================================================= */

router.get("/", async (req, res) => {

    try {

        const [rows] = await pool.execute(`
            SELECT
                id,
                name,
                email,
                phone,
                country,
                destination,
                study_level,
                priority,
                status,
                subject,
                message,
                notes,
                assigned_to,
                source,
                is_read,
                created_at,
                updated_at
            FROM consultation_inquiries
            ORDER BY created_at DESC
        `);


        return res.status(200).json({
            success: true,
            count: rows.length,
            inquiries: rows
        });


    } catch (error) {

        console.error(
            "GET INQUIRIES ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Unable to retrieve inquiries."
        });

    }

});


/* =========================================================
   GET /api/inquiries/:id
   GET SINGLE INQUIRY
   ========================================================= */

router.get("/:id", async (req, res) => {

    try {

        const inquiryId = Number(req.params.id);


        if (!Number.isInteger(inquiryId) || inquiryId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid inquiry ID."
            });

        }


        const [rows] = await pool.execute(
            `
            SELECT
                id,
                name,
                email,
                phone,
                country,
                destination,
                study_level,
                priority,
                status,
                subject,
                message,
                notes,
                assigned_to,
                source,
                is_read,
                created_at,
                updated_at
            FROM consultation_inquiries
            WHERE id = ?
            LIMIT 1
            `,
            [inquiryId]
        );


        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Inquiry not found."
            });

        }


        return res.status(200).json({
            success: true,
            inquiry: rows[0]
        });


    } catch (error) {

        console.error(
            "GET SINGLE INQUIRY ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Unable to retrieve inquiry."
        });

    }

});


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;