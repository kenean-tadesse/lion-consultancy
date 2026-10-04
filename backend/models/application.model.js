/* =========================================================
   LION CONSULTANCY
   STUDENT APPLICATION MODEL
   ========================================================= */

"use strict";

const mongoose = require("mongoose");


/* =========================================================
   APPLICANT
   ========================================================= */

const applicantSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        nationality: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);


/* =========================================================
   EDUCATION
   ========================================================= */

const educationSchema = new mongoose.Schema(
    {
        educationLevel: {
            type: String,
            required: true
        },

        fieldOfStudy: {
            type: String,
            required: true,
            trim: true
        },

        institution: {
            type: String,
            required: true,
            trim: true
        },

        graduationYear: {
            type: String,
            required: true
        },

        gpa: {
            type: String,
            default: null
        },

        englishLevel: {
            type: String,
            default: null
        }
    },
    {
        _id: false
    }
);


/* =========================================================
   STUDY PREFERENCES
   ========================================================= */

const studyPreferencesSchema =
    new mongoose.Schema(
        {
            preferredCountry: {
                type: String,
                required: true
            },

            studyLevel: {
                type: String,
                required: true
            },

            preferredField: {
                type: String,
                required: true
            },

            intake: {
                type: String,
                default: null
            },

            preferredUniversity: {
                type: String,
                default: null,
                trim: true
            },

            studyGoals: {
                type: String,
                required: true,
                trim: true
            }
        },
        {
            _id: false
        }
    );


/* =========================================================
   APPLICATION SCHEMA
   ========================================================= */

const applicationSchema =
    new mongoose.Schema(
        {
            applicant: {
                type: applicantSchema,
                required: true
            },

            education: {
                type: educationSchema,
                required: true
            },

            studyPreferences: {
                type: studyPreferencesSchema,
                required: true
            },

            status: {
                type: String,

                enum: [
                    "submitted",
                    "under_review",
                    "documents_required",
                    "application_sent",
                    "admission_received",
                    "visa_processing",
                    "completed",
                    "rejected"
                ],

                default: "submitted"
            }
        },

        {
            timestamps: true
        }
    );


/* =========================================================
   INDEXES
   ========================================================= */

applicationSchema.index({
    "applicant.email": 1
});

applicationSchema.index({
    status: 1
});

applicationSchema.index({
    createdAt: -1
});


/* =========================================================
   MODEL
   ========================================================= */

const Application =
    mongoose.model(
        "Application",
        applicationSchema
    );


module.exports = Application;