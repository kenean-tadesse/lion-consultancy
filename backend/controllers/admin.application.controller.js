"use strict";

const { pool } = require("../config/db");

/* =========================================================
   GET APPLICATIONS
   ========================================================= */

const getApplications = async (req, res) => {
    try {
        const {
            status,
            country,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const currentPage = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const perPage = Math.min(
            Math.max(parseInt(limit, 10) || 20, 1),
            100
        );

        const offset = (currentPage - 1) * perPage;

        let where = [];
        let params = [];

        /* STATUS FILTER */
    if (status && status !== "all") {
    where.push("status = ?");
    params.push(status);
}

if (country && country !== "all") {
    where.push("preferred_country = ?");
    params.push(country);
}

        /* SEARCH */
        if (search) {
            where.push(`
                (
                    first_name LIKE ?
                    OR last_name LIKE ?
                    OR email LIKE ?
                    OR phone LIKE ?
                    OR preferred_university LIKE ?
                )
            `);

            const searchValue = `%${search}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        const whereClause =
            where.length > 0
                ? `WHERE ${where.join(" AND ")}`
                : "";

        /* COUNT */
        const [countRows] = await pool.execute(
            `
            SELECT COUNT(*) AS total
            FROM applications
            ${whereClause}
            `,
            params
        );

        const total = Number(countRows[0].total);

        /* APPLICATIONS */
        const [applications] = await pool.execute(
            `
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                nationality,
                city,
                education_level,
                field_of_study,
                institution,
                graduation_year,
                preferred_country,
                study_level,
                preferred_field,
                intake,
                preferred_university,
                status,
                created_at,
                updated_at
            FROM applications
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            `,
            [
                ...params,
                perPage,
                offset
            ]
        );

        return res.status(200).json({
            success: true,

            pagination: {
                page: currentPage,
                limit: perPage,
                total,
                totalPages: Math.ceil(total / perPage)
            },

            applications
        });

    } catch (error) {

        console.error(
            "GET APPLICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve applications."
        });
    }
};


/* =========================================================
   GET SINGLE APPLICATION
   ========================================================= */

const getApplication = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID."
            });
        }

        const [applicationRows] = await pool.execute(
            `
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                nationality,
                city,
                education_level,
                field_of_study,
                institution,
                graduation_year,
                preferred_country,
                study_level,
                preferred_field,
                intake,
                preferred_university,
                status,
                created_at,
                updated_at
            FROM applications
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (applicationRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        return res.status(200).json({
            success: true,
            application: applicationRows[0]
        });

    } catch (error) {
        console.error("GET APPLICATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve application."
        });
    }
};

/* =========================================================
   UPDATE APPLICATION STATUS
   + CREATE STATUS HISTORY
   ========================================================= */

const updateApplicationStatus = async (req, res) => {

    let connection;

    try {

        const { id } = req.params;
        const { status } = req.body;

        /* -----------------------------------------
           VALIDATE APPLICATION ID
           ----------------------------------------- */

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID."
            });
        }

        /* -----------------------------------------
           ALLOWED STATUSES
           ----------------------------------------- */

        const allowedStatuses = [
            "submitted",
            "under_review",
            "documents_required",
            "application_sent",
            "admission_received",
            "visa_processing",
            "completed",
            "rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status."
            });
        }

        /* -----------------------------------------
           ADMIN AUTH CHECK
           ----------------------------------------- */

        if (!req.admin || !req.admin.id) {
            return res.status(401).json({
                success: false,
                message: "Administrator authentication required."
            });
        }

        /* -----------------------------------------
           GET DATABASE CONNECTION
           ----------------------------------------- */

        connection = await pool.getConnection();

        /* -----------------------------------------
           START TRANSACTION
           ----------------------------------------- */

        await connection.beginTransaction();

        /* -----------------------------------------
           GET CURRENT APPLICATION STATUS
           ----------------------------------------- */

        const [applications] = await connection.execute(
            `
            SELECT
                id,
                status
            FROM applications
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (applications.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        const oldStatus = applications[0].status;

        /* -----------------------------------------
           NO-OP STATUS CHANGE
           ----------------------------------------- */

        if (oldStatus === status) {

            await connection.rollback();

            return res.status(200).json({
                success: true,
                message: "Application status is already set to this value.",
                application: {
                    id: Number(id),
                    status: oldStatus
                }
            });
        }

        /* -----------------------------------------
           UPDATE APPLICATION
           ----------------------------------------- */

        await connection.execute(
            `
            UPDATE applications
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                id
            ]
        );

        /* -----------------------------------------
           INSERT STATUS HISTORY
           ----------------------------------------- */

        await connection.execute(
            `
            INSERT INTO application_status_history (
                application_id,
                old_status,
                new_status,
                changed_by_admin_id
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                id,
                oldStatus,
                status,
                req.admin.id
            ]
        );

        /* -----------------------------------------
           COMMIT TRANSACTION
           ----------------------------------------- */

        await connection.commit();

        /* -----------------------------------------
           GET UPDATED APPLICATION
           ----------------------------------------- */

        const [updatedRows] = await connection.execute(
            `
            SELECT
                id,
                first_name,
                last_name,
                email,
                preferred_country,
                preferred_university,
                status,
                updated_at
            FROM applications
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return res.status(200).json({
            success: true,

            message:
                "Application status updated successfully.",

            application: updatedRows[0]
        });

    } catch (error) {

        /* -----------------------------------------
           ROLLBACK IF TRANSACTION IS ACTIVE
           ----------------------------------------- */

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "ROLLBACK ERROR:",
                    rollbackError
                );
            }
        }

        console.error(
            "UPDATE APPLICATION STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update application status."
        });

    } finally {

        /* -----------------------------------------
           RELEASE CONNECTION
           ----------------------------------------- */

        if (connection) {
            connection.release();
        }
    }
};


/* =========================================================
   GET APPLICATION STATUS HISTORY
   ========================================================= */

const getApplicationHistory = async (req, res) => {

    try {

        const { id } = req.params;

        /* -----------------------------------------
           VALIDATE APPLICATION ID
           ----------------------------------------- */

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID."
            });
        }

        /* -----------------------------------------
           CHECK APPLICATION EXISTS
           ----------------------------------------- */

        const [applicationRows] = await pool.execute(
            `
            SELECT
                id,
                first_name,
                last_name,
                status
            FROM applications
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (applicationRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        /* -----------------------------------------
           GET HISTORY
           ----------------------------------------- */

        const [historyRows] = await pool.execute(
            `
            SELECT
                h.id,
                h.application_id,
                h.old_status,
                h.new_status,
                h.changed_at,

                a.id AS admin_id,
                a.full_name AS admin_name,
                a.email AS admin_email

            FROM application_status_history h

            LEFT JOIN admins a
                ON a.id = h.changed_by_admin_id

            WHERE h.application_id = ?

            ORDER BY h.changed_at DESC, h.id DESC
            `,
            [id]
        );

        return res.status(200).json({

            success: true,

            application: applicationRows[0],

            history: historyRows

        });

    } catch (error) {

        console.error(
            "GET APPLICATION HISTORY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to retrieve application status history."
        });
    }
};
// ============================================================
// CONVERT APPLICATION TO STUDENT
// ============================================================

const convertApplicationToStudent = async (req, res) => {
    try {
        const applicationId = Number(req.params.id);

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID."
            });
        }

        // ----------------------------------------------------
        // Get application
        // ----------------------------------------------------

        const [applications] = await pool.query(
            `
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                nationality,
                city,
                preferred_country,
                study_level,
                preferred_field,
                preferred_university,
                intake
            FROM applications
            WHERE id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        const application = applications[0];

        // ----------------------------------------------------
        // Check whether already converted
        // ----------------------------------------------------

        const [existingStudents] = await pool.query(
            `
            SELECT
                id,
                student_number,
                first_name,
                last_name
            FROM students
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        if (existingStudents.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This application has already been converted to a student.",
                student: existingStudents[0]
            });
        }

        // ----------------------------------------------------
        // Create student
        // ----------------------------------------------------

        const [result] = await pool.query(
            `
            INSERT INTO students (
                application_id,
                first_name,
                last_name,
                email,
                phone,
                nationality,
                city,
                preferred_country,
                study_level,
                preferred_field,
                preferred_university,
                intake,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
            `,
            [
                application.id,
                application.first_name,
                application.last_name,
                application.email,
                application.phone,
                application.nationality,
                application.city,
                application.preferred_country,
                application.study_level,
                application.preferred_field,
                application.preferred_university,
                application.intake
            ]
        );

        // ----------------------------------------------------
        // Generate student number
        // ----------------------------------------------------

        const year = new Date().getFullYear();

        const studentNumber =
            `LC-${year}-${String(result.insertId).padStart(6, "0")}`;

        await pool.query(
            `
            UPDATE students
            SET student_number = ?
            WHERE id = ?
            `,
            [studentNumber, result.insertId]
        );

        // ----------------------------------------------------
        // Return created student
        // ----------------------------------------------------

        const [students] = await pool.query(
            `
            SELECT *
            FROM students
            WHERE id = ?
            LIMIT 1
            `,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Application successfully converted to student.",
            student: students[0]
        });

    } catch (error) {
        console.error(
            "CONVERT APPLICATION TO STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to convert application to student."
        });
    }
};
/* =========================================================
   EXPORTS
   ========================================================= */
module.exports = {
    getApplications,
    getApplication,
    updateApplicationStatus,
    getApplicationHistory,
    convertApplicationToStudent
};