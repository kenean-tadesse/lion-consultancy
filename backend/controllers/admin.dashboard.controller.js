"use strict";

const { pool } = require("../config/db");

/*
=========================================================
GET ADMIN DASHBOARD STATISTICS
=========================================================
*/

const getDashboardStats = async (req, res) => {
    try {
        const [totalRows] = await pool.execute(`
            SELECT COUNT(*) AS total
            FROM applications
        `);

        const [statusRows] = await pool.execute(`
            SELECT
                status,
                COUNT(*) AS count
            FROM applications
            GROUP BY status
        `);

        const [recentRows] = await pool.execute(`
            SELECT
                id,
                first_name,
                last_name,
                email,
                preferred_country,
                study_level,
                preferred_field,
                status,
                created_at
            FROM applications
            ORDER BY created_at DESC
            LIMIT 5
        `);

        const statusCounts = {
            submitted: 0,
            under_review: 0,
            documents_required: 0,
            application_sent: 0,
            admission_received: 0,
            visa_processing: 0,
            completed: 0,
            rejected: 0
        };

        statusRows.forEach((row) => {
            if (Object.prototype.hasOwnProperty.call(statusCounts, row.status)) {
                statusCounts[row.status] = Number(row.count);
            }
        });

        return res.status(200).json({
            success: true,

            statistics: {
                total: Number(totalRows[0].total),
                ...statusCounts
            },

            recentApplications: recentRows
        });

    } catch (error) {
        console.error(
            "GET DASHBOARD STATS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve dashboard statistics."
        });
    }
};

module.exports = {
    getDashboardStats
};