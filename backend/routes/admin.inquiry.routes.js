"use strict";

/* =========================================================
   LION CONSULTANCY
   ADMIN CONSULTATION INQUIRY ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) => {

    if (
        value === undefined ||
        value === null
    ) {
        return null;
    }

    const result =
        String(value).trim();

    return result === ""
        ? null
        : result;
};

const allowedStatuses = [
    "new",
    "contacted",
    "consultation",
    "followup",
    "converted",
    "closed"
];

const allowedPriorities = [
    "urgent",
    "high",
    "normal",
    "low"
];

function getInquiryId(value) {

    const id = Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
}

/* =========================================================
   GET ALL INQUIRIES
   GET /api/admin/inquiries
========================================================= */

router.get("/", async (req, res) => {

    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            status = "all",
            priority = "all",
            country = "all",
            sort = "newest"
        } = req.query;

        page =
            Math.max(
                Number(page) || 1,
                1
            );

        limit =
            Math.min(
                Math.max(
                    Number(limit) || 10,
                    1
                ),
                100
            );

        const offset =
            (page - 1) * limit;

        const conditions = [];
        const params = [];

        /* SEARCH */

        if (
            search &&
            String(search).trim() !== ""
        ) {

            const searchValue =
                `%${String(search).trim()}%`;

            conditions.push(`
                (
                    name LIKE ?
                    OR email LIKE ?
                    OR phone LIKE ?
                    OR subject LIKE ?
                    OR message LIKE ?
                    OR destination LIKE ?
                    OR country LIKE ?
                )
            `);

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        /* STATUS */

        if (
            status !== "all" &&
            allowedStatuses.includes(status)
        ) {

            conditions.push(
                "status = ?"
            );

            params.push(status);
        }

        /* PRIORITY */

        if (
            priority !== "all" &&
            allowedPriorities.includes(
                priority
            )
        ) {

            conditions.push(
                "priority = ?"
            );

            params.push(priority);
        }

        /* COUNTRY */

        if (
            country &&
            country !== "all"
        ) {

            conditions.push(
                "country = ?"
            );

            params.push(country);
        }

        const whereClause =
            conditions.length
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        /* SORT */

        let orderBy =
            "created_at DESC";

        switch (sort) {

            case "oldest":

                orderBy =
                    "created_at ASC";

                break;

            case "priority":

                orderBy = `
                    CASE priority
                        WHEN 'urgent' THEN 1
                        WHEN 'high' THEN 2
                        WHEN 'normal' THEN 3
                        WHEN 'low' THEN 4
                        ELSE 5
                    END ASC,
                    created_at DESC
                `;

                break;

            case "unread":

                orderBy = `
                    is_read ASC,
                    created_at DESC
                `;

                break;

            case "newest":
            default:

                orderBy =
                    "created_at DESC";
        }

        /* COUNT */

        const [countRows] =
            await pool.execute(
                `
                    SELECT COUNT(*) AS total
                    FROM consultation_inquiries
                    ${whereClause}
                `,
                params
            );

        const total =
            Number(
                countRows[0]?.total || 0
            );

        const totalPages =
            Math.max(
                Math.ceil(
                    total / limit
                ),
                1
            );

        /* DATA */

        const [rows] =
            await pool.execute(
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

                        assigned_to AS assigned,

                        source,

                        CASE
                            WHEN is_read = 0
                            THEN 1
                            ELSE 0
                        END AS unread,

                        is_read,
                        created_at,
                        updated_at

                    FROM consultation_inquiries

                    ${whereClause}

                    ORDER BY ${orderBy}

                    LIMIT ? OFFSET ?
                `,
                [
                    ...params,
                    limit,
                    offset
                ]
            );

        return res.status(200).json({

            success: true,

            inquiries: rows,

            pagination: {
                page,
                limit,
                total,
                totalPages
            }

        });

    } catch (error) {

        console.error(
            "ADMIN GET INQUIRIES ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load inquiries."

        });
    }
});

/* =========================================================
   GET STATISTICS
   GET /api/admin/inquiries/stats
========================================================= */

router.get(
    "/stats",
    async (req, res) => {

        try {

            const [rows] =
                await pool.execute(`
                    SELECT

                        COUNT(*) AS total,

                        SUM(
                            CASE
                                WHEN status = 'new'
                                THEN 1
                                ELSE 0
                            END
                        ) AS new_count,

                        SUM(
                            CASE
                                WHEN status = 'followup'
                                THEN 1
                                ELSE 0
                            END
                        ) AS followup_count,

                        SUM(
                            CASE
                                WHEN priority IN (
                                    'urgent',
                                    'high'
                                )
                                THEN 1
                                ELSE 0
                            END
                        ) AS priority_count,

                        SUM(
                            CASE
                                WHEN status = 'converted'
                                THEN 1
                                ELSE 0
                            END
                        ) AS converted_count,

                        SUM(
                            CASE
                                WHEN status = 'contacted'
                                THEN 1
                                ELSE 0
                            END
                        ) AS contacted_count,

                        SUM(
                            CASE
                                WHEN status = 'consultation'
                                THEN 1
                                ELSE 0
                            END
                        ) AS consultation_count,

                        SUM(
                            CASE
                                WHEN status = 'closed'
                                THEN 1
                                ELSE 0
                            END
                        ) AS closed_count,

                        SUM(
                            CASE
                                WHEN is_read = 0
                                THEN 1
                                ELSE 0
                            END
                        ) AS unread_count

                    FROM consultation_inquiries
                `);

            const stats =
                rows[0] || {};

            return res.status(200).json({

                success: true,

                stats: {

                    total:
                        Number(
                            stats.total || 0
                        ),

                    new:
                        Number(
                            stats.new_count || 0
                        ),

                    followup:
                        Number(
                            stats.followup_count || 0
                        ),

                    priority:
                        Number(
                            stats.priority_count || 0
                        ),

                    converted:
                        Number(
                            stats.converted_count || 0
                        ),

                    contacted:
                        Number(
                            stats.contacted_count || 0
                        ),

                    consultation:
                        Number(
                            stats.consultation_count || 0
                        ),

                    closed:
                        Number(
                            stats.closed_count || 0
                        ),

                    unread:
                        Number(
                            stats.unread_count || 0
                        )
                }
            });

        } catch (error) {

            console.error(
                "ADMIN INQUIRY STATS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load inquiry statistics."
            });
        }
    }
);

/* =========================================================
   GET SINGLE INQUIRY
   GET /api/admin/inquiries/:id
========================================================= */

router.get(
    "/:id",
    async (req, res) => {

        try {

            const inquiryId =
                getInquiryId(
                    req.params.id
                );

            if (!inquiryId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry ID."
                });
            }

            const [rows] =
                await pool.execute(
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

                            assigned_to AS assigned,

                            source,

                            CASE
                                WHEN is_read = 0
                                THEN 1
                                ELSE 0
                            END AS unread,

                            is_read,
                            created_at,
                            updated_at

                        FROM consultation_inquiries

                        WHERE id = ?

                        LIMIT 1
                    `,
                    [inquiryId]
                );

            if (!rows.length) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Inquiry not found."
                });
            }

            return res.status(200).json({

                success: true,

                inquiry: rows[0]
            });

        } catch (error) {

            console.error(
                "ADMIN GET SINGLE INQUIRY ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load inquiry."
            });
        }
    }
);

/* =========================================================
   CREATE INQUIRY
   POST /api/admin/inquiries
========================================================= */

router.post(
    "/",
    async (req, res) => {

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
                assigned,
                assignedTo,
                assigned_to,
                source
            } = req.body;

            const cleanedName =
                clean(name);

            const cleanedEmail =
                clean(email);

            if (!cleanedName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name is required."
                });
            }

            if (!cleanedEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required."
                });
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    cleanedEmail
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid email address."
                });
            }

            const finalPriority =
                allowedPriorities.includes(
                    priority
                )
                    ? priority
                    : "normal";

            const finalStatus =
                allowedStatuses.includes(
                    status
                )
                    ? status
                    : "new";

            const finalStudyLevel =
                clean(studyLevel) ||
                clean(study_level);

            const finalAssigned =
                clean(assigned) ||
                clean(assignedTo) ||
                clean(assigned_to);

            const finalSource =
                clean(source) ||
                "admin";

            const [result] =
                await pool.execute(
                    `
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

                        VALUES (
                            ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?,
                            ?, ?, ?, ?
                        )
                    `,
                    [

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

                        finalAssigned,

                        finalSource,

                        1
                    ]
                );

            return res.status(201).json({

                success: true,

                message:
                    "Inquiry created successfully.",

                inquiryId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "ADMIN CREATE INQUIRY ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create inquiry."
            });
        }
    }
);

/* =========================================================
   UPDATE INQUIRY
   PATCH /api/admin/inquiries/:id
========================================================= */

router.patch(
    "/:id",
    async (req, res) => {

        try {

            const inquiryId =
                getInquiryId(
                    req.params.id
                );

            if (!inquiryId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry ID."
                });
            }

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
                assigned,
                assignedTo,
                assigned_to,
                source
            } = req.body;

            const cleanedName =
                clean(name);

            const cleanedEmail =
                clean(email);

            if (!cleanedName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name is required."
                });
            }

            if (!cleanedEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required."
                });
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    cleanedEmail
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid email address."
                });
            }

            const finalPriority =
                allowedPriorities.includes(
                    priority
                )
                    ? priority
                    : "normal";

            const finalStatus =
                allowedStatuses.includes(
                    status
                )
                    ? status
                    : "new";

            const finalStudyLevel =
                clean(studyLevel) ||
                clean(study_level);

            const finalAssigned =
                clean(assigned) ||
                clean(assignedTo) ||
                clean(assigned_to);

            const [result] =
                await pool.execute(
                    `
                        UPDATE consultation_inquiries

                        SET

                            name = ?,
                            email = ?,
                            phone = ?,
                            country = ?,
                            destination = ?,
                            study_level = ?,
                            priority = ?,
                            status = ?,
                            subject = ?,
                            message = ?,
                            notes = ?,
                            assigned_to = ?,
                            source = ?

                        WHERE id = ?
                    `,
                    [

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

                        finalAssigned,

                        clean(source) ||
                            "admin",

                        inquiryId
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Inquiry not found."
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Inquiry updated successfully."
            });

        } catch (error) {

            console.error(
                "ADMIN UPDATE INQUIRY ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update inquiry."
            });
        }
    }
);

/* =========================================================
   UPDATE STATUS
========================================================= */

router.patch(
    "/:id/status",
    async (req, res) => {

        try {

            const inquiryId =
                getInquiryId(
                    req.params.id
                );

            if (!inquiryId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry ID."
                });
            }

            const { status } =
                req.body;

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry status."
                });
            }

            const [result] =
                await pool.execute(
                    `
                        UPDATE consultation_inquiries

                        SET status = ?

                        WHERE id = ?
                    `,
                    [
                        status,
                        inquiryId
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Inquiry not found."
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Inquiry status updated successfully."
            });

        } catch (error) {

            console.error(
                "ADMIN UPDATE STATUS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update inquiry status."
            });
        }
    }
);

/* =========================================================
   UPDATE PRIORITY
========================================================= */

router.patch(
    "/:id/priority",
    async (req, res) => {

        try {

            const inquiryId =
                getInquiryId(
                    req.params.id
                );

            if (!inquiryId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry ID."
                });
            }

            const { priority } =
                req.body;

            if (
                !allowedPriorities.includes(
                    priority
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry priority."
                });
            }

            const [result] =
                await pool.execute(
                    `
                        UPDATE consultation_inquiries

                        SET priority = ?

                        WHERE id = ?
                    `,
                    [
                        priority,
                        inquiryId
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Inquiry not found."
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Inquiry priority updated successfully."
            });

        } catch (error) {

            console.error(
                "ADMIN UPDATE PRIORITY ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update inquiry priority."
            });
        }
    }
);

/* =========================================================
   MARK READ / UNREAD
========================================================= */

router.patch(
    "/:id/read",
    async (req, res) => {

        try {

            const inquiryId =
                getInquiryId(
                    req.params.id
                );

            if (!inquiryId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry ID."
                });
            }

            const isRead =
                req.body.isRead === true ||
                req.body.is_read === true ||
                Number(
                    req.body.isRead
                ) === 1 ||
                Number(
                    req.body.is_read
                ) === 1
                    ? 1
                    : 0;

            const [result] =
                await pool.execute(
                    `
                        UPDATE consultation_inquiries

                        SET is_read = ?

                        WHERE id = ?
                    `,
                    [
                        isRead,
                        inquiryId
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Inquiry not found."
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    isRead
                        ? "Inquiry marked as read."
                        : "Inquiry marked as unread."
            });

        } catch (error) {

            console.error(
                "ADMIN UPDATE READ STATUS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update read status."
            });
        }
    }
);

/* =========================================================
   DELETE
========================================================= */

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const inquiryId =
                getInquiryId(
                    req.params.id
                );

            if (!inquiryId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid inquiry ID."
                });
            }

            const [result] =
                await pool.execute(
                    `
                        DELETE FROM consultation_inquiries

                        WHERE id = ?
                    `,
                    [inquiryId]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Inquiry not found."
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Inquiry deleted successfully."
            });

        } catch (error) {

            console.error(
                "ADMIN DELETE INQUIRY ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete inquiry."
            });
        }
    }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;