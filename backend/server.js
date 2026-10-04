/* =========================================================
   LION CONSULTANCY
   MAIN EXPRESS SERVER
   ========================================================= */

"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
/* =========================================================
   DATABASE
   ========================================================= */

const { connectDB } = require("./config/db");

/* =========================================================
   ROUTES
   ========================================================= */

const employeeRoutes = require("./routes/employee.routes");
const applicationRoutes = require("./routes/application.routes");
const adminRoutes =
    require("./routes/admin.routes");
const adminApplicationRoutes = require("./routes/admin.application.routes");
const adminDashboardRoutes =
    require("./routes/admin.dashboard.routes");

    const studentRoutes = require("./routes/student.routes");

    const inquiryRoutes = require("./routes/inquiry.routes");
const adminInquiryRoutes = require("./routes/admin.inquiry.routes");
/* =========================================================
   APP INITIALIZATION
   ========================================================= */

const app = express();


/* =========================================================
   ENVIRONMENT
   ========================================================= */

const PORT = process.env.PORT || 5000;

const NODE_ENV =
    process.env.NODE_ENV || "development";


/* =========================================================
   DATABASE CONNECTION
   ========================================================= */

connectDB();


/* =========================================================
   GLOBAL MIDDLEWARE
   ========================================================= */

/*
 * JSON request body
 */

app.use(
    express.json({
        limit: "2mb"
    })
);


/*
 * URL encoded request body
 */

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);
app.use(cookieParser());

/*
 * CORS
 */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


/* =========================================================
   REQUEST LOGGING
   ========================================================= */

app.use((req, res, next) => {

    console.log(
        `${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
    );

    next();
});


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Lion Consultancy API is running.",

            environment:
                NODE_ENV,

            timestamp:
                new Date().toISOString()
        });
    }
);


/* =========================================================
   API HEALTH CHECK
   ========================================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            service:
                "Lion Consultancy API",

            status:
                "online",

            timestamp:
                new Date().toISOString()
        });
    }
);


/* =========================================================
   EMPLOYEE API
   ========================================================= */

app.use(
    "/api/employees",
    employeeRoutes
);


/* =========================================================
   STUDENT APPLICATION API
   ========================================================= */

app.use(
    "/api/applications",
    applicationRoutes
);

app.use("/api/admin", adminRoutes);

app.use("/api/admin/applications", adminApplicationRoutes);

app.use("/api/inquiries", inquiryRoutes);

app.use(
    "/api/admin/dashboard",
    adminDashboardRoutes
);

app.use("/api/admin/students", studentRoutes);

app.use("/api/admin/inquiries", adminInquiryRoutes);
/* =========================================================
   STATIC FRONTEND
   ========================================================= */

/*
 * The frontend is located one level above /server.
 *
 * Project:
 *
 * lion-consultancy/
 * ├── server/
 * ├── pages/
 * ├── css/
 * ├── js/
 * ├── images/
 * └── index.html
 */

const frontendPath =
    path.join(__dirname, "..", "fronted");


app.use(
    express.static(frontendPath)
);


/* =========================================================
   404 HANDLER
   ========================================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found.",

            path:
                req.originalUrl
        });
    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use(
    (err, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            err
        );


        if (res.headersSent) {
            return next(err);
        }


        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                NODE_ENV === "production"
                    ? "Internal server error."
                    : err.message
        });
    }
);


/* =========================================================
   START SERVER
   ========================================================= */

const server =
   app.listen(
    PORT,
    "0.0.0.0",
        () => {

            console.log("");
            console.log(
                "=========================================="
            );
            console.log(
                "       LION CONSULTANCY API SERVER"
            );
            console.log(
                "=========================================="
            );

            console.log(
                `Environment : ${NODE_ENV}`
            );

            console.log(
                `Port        : ${PORT}`
            );

            console.log(
                `URL         : http://localhost:${PORT}`
            );

            console.log(
                `Health      : http://localhost:${PORT}/api/health`
            );

            console.log(
                `Applications: http://localhost:${PORT}/api/applications`
            );

            console.log(
                `Employees   : http://localhost:${PORT}/api/employees`
            );

            console.log(
                "=========================================="
            );

            console.log("");
        }
    );


/* =========================================================
   SERVER ERROR HANDLING
   ========================================================= */

server.on(
    "error",
    (error) => {

        if (error.code === "EADDRINUSE") {

            console.error(
                `Port ${PORT} is already in use.`
            );

            process.exit(1);
        }


        console.error(
            "Server startup error:",
            error
        );

        process.exit(1);
    }
);


/* =========================================================
   GRACEFUL SHUTDOWN
   ========================================================= */

process.on(
    "SIGINT",
    () => {

        console.log(
            "\nShutting down Lion Consultancy server..."
        );


        server.close(
            () => {

                console.log(
                    "Server stopped."
                );

                process.exit(0);
            }
        );
    }
);


process.on(
    "SIGTERM",
    () => {

        console.log(
            "\nSIGTERM received. Shutting down..."
        );


        server.close(
            () => {

                console.log(
                    "Server stopped."
                );

                process.exit(0);
            }
        );
    }
);