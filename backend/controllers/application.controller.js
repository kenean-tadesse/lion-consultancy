/* =========================================================
   LION CONSULTANCY
   STUDENT APPLICATION CONTROLLER
   MYSQL VERSION
   ========================================================= */

"use strict";

const {
    pool
} = require("../config/db");


/* =========================================================
   CREATE APPLICATION
   ========================================================= */

const createApplication = async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            nationality,
            city,

            educationLevel,
            fieldOfStudy,
            institution,
            graduationYear,
            gpa,
            englishLevel,

            preferredCountry,
            studyLevel,
            preferredField,
            intake,
            preferredUniversity,
            studyGoals
        } = req.body;


        /* =================================================
           REQUIRED FIELDS
           ================================================= */

        const requiredFields = {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            nationality,
            city,

            educationLevel,
            fieldOfStudy,
            institution,
            graduationYear,

            preferredCountry,
            studyLevel,
            preferredField,
            studyGoals
        };


        const missingFields =
            Object.entries(requiredFields)
                .filter(
                    ([, value]) =>
                        value === undefined ||
                        value === null ||
                        String(value).trim() === ""
                )
                .map(([key]) => key);


        if (missingFields.length > 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Required application fields are missing.",

                missingFields
            });
        }


        /* =================================================
           EMAIL VALIDATION
           ================================================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."
            });
        }


        /* =================================================
           CHECK EXISTING APPLICATION
           ================================================= */

        const [existingApplications] =
            await pool.execute(
                `
                SELECT id
                FROM applications
                WHERE email = ?
                LIMIT 1
                `,
                [
                    email.trim().toLowerCase()
                ]
            );


        if (existingApplications.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "An application already exists for this email address.",

                applicationId:
                    existingApplications[0].id
            });
        }


        /* =================================================
           INSERT APPLICATION
           ================================================= */

        const [result] =
            await pool.execute(
                `
                INSERT INTO applications (

                    first_name,
                    last_name,
                    email,
                    phone,
                    date_of_birth,
                    nationality,
                    city,

                    education_level,
                    field_of_study,
                    institution,
                    graduation_year,
                    gpa,
                    english_level,

                    preferred_country,
                    study_level,
                    preferred_field,
                    intake,
                    preferred_university,
                    study_goals,

                    status

                )

                VALUES (

                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,

                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,

                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,

                    'submitted'
                )
                `,
                [

                    firstName.trim(),
                    lastName.trim(),

                    email.trim().toLowerCase(),

                    phone.trim(),

                    dateOfBirth,

                    nationality.trim(),

                    city.trim(),

                    educationLevel,

                    fieldOfStudy.trim(),

                    institution.trim(),

                    graduationYear,

                    gpa || null,

                    englishLevel || null,

                    preferredCountry,

                    studyLevel,

                    preferredField,

                    intake || null,

                    preferredUniversity || null,

                    studyGoals.trim()
                ]
            );


        /* =================================================
           SUCCESS
           ================================================= */

        return res.status(201).json({

            success: true,

            message:
                "Application submitted successfully.",

            application: {

                id:
                    result.insertId,

                status:
                    "submitted"
            }
        });


    } catch (error) {

        console.error(
            "Application creation error:",
            error
        );


        /* ================================================
           DUPLICATE EMAIL
           ================================================ */

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({

                success: false,

                message:
                    "An application already exists for this email address."
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to submit application."
        });
    }
};


/* =========================================================
   GET APPLICATION BY ID
   ========================================================= */

const getApplicationById = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    date_of_birth,
                    nationality,
                    city,

                    education_level,
                    field_of_study,
                    institution,
                    graduation_year,
                    gpa,
                    english_level,

                    preferred_country,
                    study_level,
                    preferred_field,
                    intake,
                    preferred_university,
                    study_goals,

                    status,
                    created_at,
                    updated_at

                FROM applications

                WHERE id = ?

                LIMIT 1
                `,
                [id]
            );


        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found."
            });
        }


        return res.status(200).json({

            success: true,

            application:
                rows[0]
        });


    } catch (error) {

        console.error(
            "Get application error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to retrieve application."
        });
    }
};


/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {

    createApplication,

    getApplicationById
};