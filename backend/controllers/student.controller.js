
"use strict";

const { pool } = require("../config/db");


/* =========================================================
   GET STUDENTS
   GET /api/admin/students
   ========================================================= */

const getStudents = async (req, res) => {
    try {
        const {
            country,
            status,
            search,
            page = 1,
            limit = 20
        } = req.query;


        const currentPage = Math.max(
            parseInt(page, 10) || 1,
            1
        );


        const perPage = Math.min(
            Math.max(
                parseInt(limit, 10) || 20,
                1
            ),
            100
        );


        const offset =
            (currentPage - 1) * perPage;


        const where = [];
        const params = [];


        /* -------------------------------------------------
           COUNTRY FILTER
           ------------------------------------------------- */

        if (country && country !== "all") {
            where.push(
                "s.preferred_country = ?"
            );

            params.push(country);
        }


        /* -------------------------------------------------
           STATUS FILTER
           ------------------------------------------------- */

        if (status && status !== "all") {
            where.push(
                "s.status = ?"
            );

            params.push(status);
        }


        /* -------------------------------------------------
           SEARCH
           ------------------------------------------------- */

        if (search) {

            where.push(`
                (
                    s.first_name LIKE ?
                    OR s.last_name LIKE ?
                    OR s.email LIKE ?
                    OR s.phone LIKE ?
                    OR s.student_number LIKE ?
                    OR s.preferred_university LIKE ?
                )
            `);


            const searchValue =
                `%${search}%`;


            params.push(
                searchValue,
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


        /* -------------------------------------------------
           TOTAL COUNT
           ------------------------------------------------- */

        const [countRows] =
            await pool.execute(
                `
                SELECT COUNT(*) AS total
                FROM students s
                ${whereClause}
                `,
                params
            );


        const total =
            Number(countRows[0].total);


        /* -------------------------------------------------
           STUDENTS
           ------------------------------------------------- */

        const [students] =
            await pool.execute(
                `
                SELECT
                    s.id,
                    s.application_id,
                    s.student_number,

                    s.first_name,
                    s.last_name,

                    s.email,
                    s.phone,

                    s.nationality,
                    s.city,

                    s.preferred_country,
                    s.study_level,
                    s.preferred_field,

                    s.preferred_university,
                    s.intake,

                    s.status,

                    s.created_at,
                    s.updated_at

                FROM students s

                ${whereClause}

                ORDER BY s.created_at DESC

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
                totalPages:
                    Math.ceil(
                        total / perPage
                    )
            },

            students
        });

    } catch (error) {

        console.error(
            "GET STUDENTS ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to retrieve students."
        });
    }
};


/* =========================================================
   GET SINGLE STUDENT
   GET /api/admin/students/:id
   ========================================================= */

const getStudent = async (req, res) => {

    try {

        const { id } =
            req.params;


        if (!/^\d+$/.test(id)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid student ID."
            });
        }


        const [rows] =
            await pool.execute(
                `
                SELECT
                    s.*,

                    a.status AS application_status,
                    a.created_at AS application_created_at

                FROM students s

                LEFT JOIN applications a
                    ON a.id = s.application_id

                WHERE s.id = ?

                LIMIT 1
                `,
                [id]
            );


        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }


        return res.status(200).json({
            success: true,
            student: rows[0]
        });

    } catch (error) {

        console.error(
            "GET STUDENT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to retrieve student."
        });
    }
};


/* =========================================================
   CREATE STUDENT
   POST /api/admin/students
   ========================================================= */

const createStudent = async (req, res) => {

    try {

        const {
            application_id,
            student_number,
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
        } = req.body;


        /* -------------------------------------------------
           REQUIRED FIELDS
           ------------------------------------------------- */

        const requiredFields = {
            application_id,
            first_name,
            last_name,
            email,
            phone,
            nationality,
            city,
            preferred_country,
            study_level,
            preferred_field
        };


        for (
            const [field, value]
            of Object.entries(requiredFields)
        ) {

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `${field} is required.`
                });
            }
        }


        /* -------------------------------------------------
           VALIDATE APPLICATION
           ------------------------------------------------- */

        if (
            !/^\d+$/.test(
                String(application_id)
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid application ID."
            });
        }


        const [applicationRows] =
            await pool.execute(
                `
                SELECT id
                FROM applications
                WHERE id = ?
                LIMIT 1
                `,
                [application_id]
            );


        if (
            applicationRows.length === 0
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Application not found."
            });
        }


        /* -------------------------------------------------
           CHECK EXISTING STUDENT
           ------------------------------------------------- */

        const [existingRows] =
            await pool.execute(
                `
                SELECT id
                FROM students
                WHERE application_id = ?
                LIMIT 1
                `,
                [application_id]
            );


        if (existingRows.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "This application is already linked to a student."
            });
        }


        /* -------------------------------------------------
           VALIDATE STATUS
           ------------------------------------------------- */

        const allowedStatuses = [
            "active",
            "admission_received",
            "visa_processing",
            "enrolled",
            "completed",
            "inactive"
        ];


        const studentStatus =
            status || "active";


        if (
            !allowedStatuses.includes(
                studentStatus
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid student status."
            });
        }


        /* -------------------------------------------------
           INSERT STUDENT
           ------------------------------------------------- */

        const [result] =
            await pool.execute(
                `
                INSERT INTO students (
                    application_id,
                    student_number,

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

                VALUES (
                    ?, ?,
                    ?, ?,
                    ?, ?,
                    ?, ?,
                    ?, ?, ?,
                    ?, ?,
                    ?
                )
                `,
                [
                    application_id,
                    student_number || null,

                    String(first_name).trim(),
                    String(last_name).trim(),

                    String(email).trim().toLowerCase(),
                    String(phone).trim(),

                    String(nationality).trim(),
                    String(city).trim(),

                    String(preferred_country).trim(),
                    String(study_level).trim(),
                    String(preferred_field).trim(),

                    preferred_university
                        ? String(
                            preferred_university
                        ).trim()
                        : null,

                    intake
                        ? String(intake).trim()
                        : null,

                    studentStatus
                ]
            );


        /* -------------------------------------------------
           GET CREATED STUDENT
           ------------------------------------------------- */

        const [students] =
            await pool.execute(
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

            message:
                "Student created successfully.",

            student:
                students[0]

        });

    } catch (error) {

        console.error(
            "CREATE STUDENT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to create student."
        });
    }
};


/* =========================================================
   UPDATE STUDENT
   PATCH /api/admin/students/:id
   ========================================================= */

const updateStudent = async (req, res) => {

    try {

        const { id } =
            req.params;


        if (!/^\d+$/.test(id)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid student ID."
            });
        }


        const {
            student_number,
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
        } = req.body;


        const allowedStatuses = [
            "active",
            "admission_received",
            "visa_processing",
            "enrolled",
            "completed",
            "inactive"
        ];


        if (
            status &&
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid student status."
            });
        }


        const [existingRows] =
            await pool.execute(
                `
                SELECT id
                FROM students
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (existingRows.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }


        const updates = [];
        const params = [];


        const fields = {
            student_number,
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
        };


        Object.entries(fields).forEach(
            ([field, value]) => {

                if (
                    value !== undefined
                ) {

                    updates.push(
                        `${field} = ?`
                    );

                    params.push(
                        value === ""
                            ? null
                            : value
                    );
                }
            }
        );


        if (!updates.length) {

            return res.status(400).json({
                success: false,
                message:
                    "No fields provided for update."
            });
        }


        params.push(id);


        await pool.execute(
            `
            UPDATE students

            SET ${updates.join(", ")}

            WHERE id = ?
            `,
            params
        );


        const [rows] =
            await pool.execute(
                `
                SELECT *
                FROM students
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        return res.status(200).json({

            success: true,

            message:
                "Student updated successfully.",

            student:
                rows[0]

        });

    } catch (error) {

        console.error(
            "UPDATE STUDENT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to update student."
        });
    }
};


/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent
};