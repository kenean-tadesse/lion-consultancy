"use strict";

/* =========================================================
   LION CONSULTANCY
   ADMIN JAVASCRIPT
   LOGIN + DASHBOARD + APPLICATIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GLOBAL HELPERS
       ===================================================== */

       const API_BASE_URL =
    window.location.port === "5500"
        ? "http://localhost:5000"
        : "";

    const escapeHtml = (value) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    const formatStatus = (status) => {

        const labels = {
            submitted: "Submitted",
            under_review: "Under Review",
            documents_required: "Documents Required",
            application_sent: "Application Sent",
            admission_received: "Admission Received",
            visa_processing: "Visa Processing",
            completed: "Completed",
            rejected: "Rejected"
        };

        return labels[status] || status || "Unknown";
    };


    const statusClass = (status) => {
        return String(status || "")
            .toLowerCase()
            .replace(/_/g, "-");
    };


    const formatCountry = (country) => {

        const countries = {
            korea: "South Korea",
            china: "China",
            germany: "Germany",
            usa: "United States",
            italy: "Italy",
            uk: "United Kingdom"
        };

        return countries[
            String(country || "").toLowerCase()
        ] || country || "—";
    };


    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    };


    const formatTime = (dateValue) => {

        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    };


    const getInitials = (firstName, lastName) => {

        const first = String(firstName || "").trim();
        const last = String(lastName || "").trim();

        const firstInitial = first.charAt(0);
        const lastInitial = last.charAt(0);

        return (
            firstInitial + lastInitial
        ).toUpperCase() || "ST";
    };


    /* =====================================================
       ADMIN LOGIN
       ===================================================== */

    const loginForm =
        document.getElementById("adminLoginForm");


    if (loginForm) {

        const emailInput =
            document.getElementById("adminEmail");

        const passwordInput =
            document.getElementById("adminPassword");

        const togglePassword =
            document.getElementById("toggleAdminPassword");

        const loginButton =
            document.getElementById("adminLoginButton");

        const loginButtonText =
            document.getElementById("adminLoginButtonText");

        const loginSpinner =
            document.getElementById("adminLoginSpinner");

        const loginError =
            document.getElementById("adminLoginError");


        /* =================================================
           TOGGLE PASSWORD
           ================================================= */

        if (togglePassword && passwordInput) {

            togglePassword.addEventListener("click", () => {

                const isPassword =
                    passwordInput.type === "password";

                passwordInput.type =
                    isPassword ? "text" : "password";

                togglePassword.textContent =
                    isPassword ? "Hide" : "Show";
            });
        }


        /* =================================================
           LOGIN SUBMIT
           ================================================= */

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();


            if (loginError) {
                loginError.textContent = "";
                loginError.hidden = true;
            }


            const email =
                emailInput?.value.trim().toLowerCase();

            const password =
                passwordInput?.value || "";


            if (!email || !password) {

                if (loginError) {
                    loginError.textContent =
                        "Please enter your email and password.";

                    loginError.hidden = false;
                }

                return;
            }


            if (loginButton) {
                loginButton.disabled = true;
            }

            if (loginButtonText) {
                loginButtonText.textContent =
                    "Signing in...";
            }

            if (loginSpinner) {
                loginSpinner.hidden = false;
            }


            try {

                const response = await fetch(
                    "/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Unable to sign in."
                    );
                }


                window.location.href =
                    "./dashboard.html";


            } catch (error) {

                if (loginError) {

                    loginError.textContent =
                        error.message ||
                        "Login failed. Please try again.";

                    loginError.hidden = false;
                }


            } finally {

                if (loginButton) {
                    loginButton.disabled = false;
                }

                if (loginButtonText) {
                    loginButtonText.textContent =
                        "Sign In";
                }

                if (loginSpinner) {
                    loginSpinner.hidden = true;
                }
            }
        });


        return;
    }


    /* =====================================================
       ADMIN SIDEBAR
       ===================================================== */

    const adminSidebar =
        document.getElementById("adminSidebar");

    const adminMenuToggle =
        document.getElementById("adminMenuToggle");

    const adminSidebarOverlay =
        document.getElementById("adminSidebarOverlay");

    const adminLogoutButton =
        document.getElementById("adminLogoutButton");


    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    const closeSidebar = () => {
        if (adminSidebar) {
            adminSidebar.classList.remove("is-open");
        }

        if (adminSidebarOverlay) {
            adminSidebarOverlay.classList.remove("is-visible");
        }

        if (adminMenuToggle) {
            adminMenuToggle.setAttribute("aria-expanded", "false");
        }
    };

    const openSidebar = () => {
        if (adminSidebar) {
            adminSidebar.classList.add("is-open");
        }

        if (adminSidebarOverlay) {
            adminSidebarOverlay.classList.add("is-visible");
        }

        if (adminMenuToggle) {
            adminMenuToggle.setAttribute("aria-expanded", "true");
        }
    };

    if (adminMenuToggle) {
        adminMenuToggle.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (adminSidebar && adminSidebar.classList.contains("is-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (adminSidebarOverlay) {
        adminSidebarOverlay.addEventListener("click", closeSidebar);
    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    if (adminLogoutButton) {

        adminLogoutButton.addEventListener(
            "click",
            async () => {

                try {

                    await fetch(
                        "/api/admin/logout",
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                } finally {

                    window.location.href =
                        "./login.html";
                }
            }
        );
    }


    /* =====================================================
       DASHBOARD ELEMENTS
       ===================================================== */

    const statTotal =
        document.getElementById("statTotal");

    const statSubmitted =
        document.getElementById("statSubmitted");

    const statReview =
        document.getElementById("statReview");

    const statAdmission =
        document.getElementById("statAdmission");

    const recentApplications =
        document.getElementById("recentApplications");

    const workflowSubmitted =
        document.getElementById("workflowSubmitted");

    const workflowReview =
        document.getElementById("workflowReview");

    const workflowDocuments =
        document.getElementById("workflowDocuments");

    const workflowAdmission =
        document.getElementById("workflowAdmission");

    const workflowVisa =
        document.getElementById("workflowVisa");


    /* =====================================================
       LOAD DASHBOARD
       ===================================================== */

    const loadDashboard = async () => {

        try {

            const response = await fetch(
                "/api/admin/dashboard",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (response.status === 401) {

                window.location.href =
                    "./login.html";

                return;
            }


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load dashboard."
                );
            }


            const stats =
                data.statistics || {};


            if (statTotal) {
                statTotal.textContent =
                    stats.total ?? 0;
            }

            if (statSubmitted) {
                statSubmitted.textContent =
                    stats.submitted ?? 0;
            }

            if (statReview) {
                statReview.textContent =
                    stats.under_review ?? 0;
            }

            if (statAdmission) {
                statAdmission.textContent =
                    stats.admission_received ?? 0;
            }


            if (workflowSubmitted) {
                workflowSubmitted.textContent =
                    stats.submitted ?? 0;
            }

            if (workflowReview) {
                workflowReview.textContent =
                    stats.under_review ?? 0;
            }

            if (workflowDocuments) {
                workflowDocuments.textContent =
                    stats.documents_required ?? 0;
            }

            if (workflowAdmission) {
                workflowAdmission.textContent =
                    stats.admission_received ?? 0;
            }

            if (workflowVisa) {
                workflowVisa.textContent =
                    stats.visa_processing ?? 0;
            }


            /* =============================================
               RECENT APPLICATIONS
               ============================================= */

            if (recentApplications) {

                const applications =
                    data.recentApplications || [];


                if (!applications.length) {

                    recentApplications.innerHTML = `
                        <div class="admin-empty-state">
                            <div class="admin-empty-icon">
                                ◌
                            </div>

                            <h3>
                                No applications yet
                            </h3>

                            <p>
                                Student applications will appear here
                                when they are submitted.
                            </p>
                        </div>
                    `;

                } else {

                    recentApplications.innerHTML =
                        applications.map(
                            (application) => {

                                const fullName =
                                    `${application.first_name || ""} ${application.last_name || ""}`
                                        .trim();


                                return `
                                    <div class="admin-recent-application">

                                        <div class="admin-recent-application-main">

                                            <div class="admin-applicant-avatar">
                                                ${escapeHtml(
                                                    getInitials(
                                                        application.first_name,
                                                        application.last_name
                                                    )
                                                )}
                                            </div>

                                            <div>

                                                <strong>
                                                    ${escapeHtml(
                                                        fullName ||
                                                        "Student"
                                                    )}
                                                </strong>

                                                <span>
                                                    ${escapeHtml(
                                                        application.email ||
                                                        "—"
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <div>
                                            ${escapeHtml(
                                                formatCountry(
                                                    application.preferred_country
                                                )
                                            )}
                                        </div>


                                        <div>

                                            <span
                                                class="admin-status-badge admin-status-${escapeHtml(
                                                    statusClass(
                                                        application.status
                                                    )
                                                )}"
                                            >
                                                ${escapeHtml(
                                                    formatStatus(
                                                        application.status
                                                    )
                                                )}
                                            </span>

                                        </div>

                                    </div>
                                `;
                            }
                        ).join("");
                }
            }

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );
        }
    };


    /* =====================================================
       APPLICATIONS PAGE
       ===================================================== */

    const applicationsTableBody =
        document.getElementById(
            "applicationsTableBody"
        );


    /*
     * If this element doesn't exist,
     * we're not on the Applications page.
     */

    if (!applicationsTableBody) {

        if (
            document.getElementById("statTotal") ||
            document.getElementById("recentApplications")
        ) {
            loadDashboard();
        }

        return;
    }


    /* =====================================================
       APPLICATION PAGE ELEMENTS
       ===================================================== */

    const applicationSearch =
        document.getElementById(
            "applicationSearch"
        );

    const applicationStatusFilter =
        document.getElementById(
            "applicationStatusFilter"
        );

    const applicationCountryFilter =
        document.getElementById(
            "applicationCountryFilter"
        );

    const applicationSearchButton =
        document.getElementById(
            "applicationSearchButton"
        );

    const applicationCount =
        document.getElementById(
            "applicationCount"
        );

    const applicationsEmptyState =
        document.getElementById(
            "applicationsEmptyState"
        );

    const applicationsLoadingState =
        document.getElementById(
            "applicationsLoadingState"
        );

    const applicationPaginationInfo =
        document.getElementById(
            "applicationPaginationInfo"
        );

    const applicationPreviousPage =
        document.getElementById(
            "applicationPreviousPage"
        );

    const applicationNextPage =
        document.getElementById(
            "applicationNextPage"
        );

    const applicationPageNumber =
        document.getElementById(
            "applicationPageNumber"
        );


    /* =====================================================
       APPLICATION STATE
       ===================================================== */

    let applicationPage = 1;

    const applicationLimit = 20;

    let applicationTotal = 0;

    let applicationTotalPages = 1;


    /* =====================================================
       LOADING STATE
       ===================================================== */

    const setApplicationsLoading = (isLoading) => {

        if (applicationsLoadingState) {

            applicationsLoadingState.hidden =
                !isLoading;
        }


        if (applicationsTableBody) {

            applicationsTableBody.style.display =
                isLoading ? "none" : "";
        }


        if (
            applicationsEmptyState &&
            isLoading
        ) {
            applicationsEmptyState.hidden = true;
        }
    };


    /* =====================================================
       RENDER APPLICATIONS
       ===================================================== */

    const renderApplications = (
        applications
    ) => {

        if (!applications.length) {

            applicationsTableBody.innerHTML = "";

            if (applicationsEmptyState) {
                applicationsEmptyState.hidden = false;
            }

            return;
        }


        if (applicationsEmptyState) {
            applicationsEmptyState.hidden = true;
        }


        applicationsTableBody.innerHTML =
            applications.map(
                (application) => {

                    const fullName =
                        `${application.first_name || ""} ${application.last_name || ""}`
                            .trim();


                    return `
                        <tr>

                            <!-- Applicant -->

                            <td>

                                <div class="admin-applicant-cell">

                                    <div class="admin-applicant-avatar">
                                        ${escapeHtml(
                                            getInitials(
                                                application.first_name,
                                                application.last_name
                                            )
                                        )}
                                    </div>

                                    <div>

                                        <span class="admin-applicant-name">
                                            ${escapeHtml(
                                                fullName ||
                                                "Student"
                                            )}
                                        </span>

                                        <span class="admin-applicant-id">
                                            Application #${escapeHtml(
                                                application.id
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </td>


                            <!-- Contact -->

                            <td>

                                <div class="admin-contact-cell">

                                    <span class="admin-contact-email">
                                        ${escapeHtml(
                                            application.email ||
                                            "—"
                                        )}
                                    </span>

                                    <span class="admin-contact-phone">
                                        ${escapeHtml(
                                            application.phone ||
                                            "—"
                                        )}
                                    </span>

                                </div>

                            </td>


                            <!-- Destination -->

                            <td>

                                <div class="admin-destination-cell">

                                    <span class="admin-destination-name">
                                        ${escapeHtml(
                                            formatCountry(
                                                application.preferred_country
                                            )
                                        )}
                                    </span>

                                    <span class="admin-destination-intake">
                                        ${escapeHtml(
                                            application.intake ||
                                            "Intake not specified"
                                        )}
                                    </span>

                                </div>

                            </td>


                            <!-- Study Plan -->

                            <td>

                                <div class="admin-study-cell">

                                    <span class="admin-study-level">
                                        ${escapeHtml(
                                            application.study_level ||
                                            "—"
                                        )}
                                    </span>

                                    <span
                                        class="admin-study-field"
                                        title="${escapeHtml(
                                            application.preferred_field ||
                                            ""
                                        )}"
                                    >
                                        ${escapeHtml(
                                            application.preferred_field ||
                                            "Field not specified"
                                        )}
                                    </span>

                                </div>

                            </td>


                            <!-- Status -->

                            <td>

                                <span
                                    class="admin-status-badge admin-status-${escapeHtml(
                                        statusClass(
                                            application.status
                                        )
                                    )}"
                                >
                                    ${escapeHtml(
                                        formatStatus(
                                            application.status
                                        )
                                    )}
                                </span>

                            </td>


                            <!-- Date -->

                            <td>

                                <div class="admin-date-cell">

                                    <span class="admin-date-main">
                                        ${escapeHtml(
                                            formatDate(
                                                application.created_at
                                            )
                                        )}
                                    </span>

                                    <span class="admin-date-time">
                                        ${escapeHtml(
                                            formatTime(
                                                application.created_at
                                            )
                                        )}
                                    </span>

                                </div>

                            </td>


                            <!-- Action -->

                            <td>

                                <button
                                    type="button"
                                    class="admin-view-application-button"
                                    data-application-id="${escapeHtml(
                                        application.id
                                    )}"
                                >
                                    View
                                </button>

                            </td>

                        </tr>
                    `;
                }
            ).join("");
    };


    /* =====================================================
       LOAD APPLICATIONS
       ===================================================== */

    const loadApplications = async () => {

        setApplicationsLoading(true);


        try {

            const params =
                new URLSearchParams();


            params.set(
                "page",
                String(applicationPage)
            );

            params.set(
                "limit",
                String(applicationLimit)
            );


            const search =
                applicationSearch?.value.trim();

            const status =
                applicationStatusFilter?.value;

            const country =
                applicationCountryFilter?.value;


            if (search) {
                params.set(
                    "search",
                    search
                );
            }

            if (status) {
                params.set(
                    "status",
                    status
                );
            }

            if (country) {
                params.set(
                    "country",
                    country
                );
            }


            const response = await fetch(
                `/api/admin/applications?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (response.status === 401) {

                window.location.href =
                    "./login.html";

                return;
            }


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load applications."
                );
            }


            const applications =
                data.applications || [];

            const pagination =
                data.pagination || {};


            applicationTotal =
                Number(
                    pagination.total || 0
                );


            applicationTotalPages =
                Math.max(
                    Number(
                        pagination.totalPages || 1
                    ),
                    1
                );


            renderApplications(
                applications
            );


            if (applicationCount) {

                applicationCount.textContent =
                    `${applicationTotal} ${
                        applicationTotal === 1
                            ? "application"
                            : "applications"
                    }`;
            }


            if (applicationPageNumber) {

                applicationPageNumber.textContent =
                    String(applicationPage);
            }


            if (applicationPaginationInfo) {

                if (applicationTotal === 0) {

                    applicationPaginationInfo.textContent =
                        "Showing 0 applications";

                } else {

                    const start =
                        (
                            (applicationPage - 1) *
                            applicationLimit
                        ) + 1;


                    const end =
                        Math.min(
                            applicationPage *
                            applicationLimit,
                            applicationTotal
                        );


                    applicationPaginationInfo.textContent =
                        `Showing ${start}–${end} of ${applicationTotal} applications`;
                }
            }


            if (applicationPreviousPage) {

                applicationPreviousPage.disabled =
                    applicationPage <= 1;
            }


            if (applicationNextPage) {

                applicationNextPage.disabled =
                    applicationPage >=
                    applicationTotalPages;
            }


        } catch (error) {

            console.error(
                "Applications loading error:",
                error
            );


            applicationsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:50px 20px;
                            opacity:.6;
                        "
                    >
                        Unable to load applications.
                        Please refresh the page and try again.
                    </td>
                </tr>
            `;


        } finally {

            setApplicationsLoading(false);
        }
    };


    /* =====================================================
       SEARCH
       ===================================================== */

    if (applicationSearchButton) {

        applicationSearchButton.addEventListener(
            "click",
            () => {

                applicationPage = 1;

                loadApplications();
            }
        );
    }


    /* =====================================================
       ENTER TO SEARCH
       ===================================================== */

    if (applicationSearch) {

        applicationSearch.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    applicationPage = 1;

                    loadApplications();
                }
            }
        );
    }


    /* =====================================================
       FILTER CHANGES
       ===================================================== */

    if (applicationStatusFilter) {

        applicationStatusFilter.addEventListener(
            "change",
            () => {

                applicationPage = 1;

                loadApplications();
            }
        );
    }


    if (applicationCountryFilter) {

        applicationCountryFilter.addEventListener(
            "change",
            () => {

                applicationPage = 1;

                loadApplications();
            }
        );
    }


    /* =====================================================
       PAGINATION
       ===================================================== */

    if (applicationPreviousPage) {

        applicationPreviousPage.addEventListener(
            "click",
            () => {

                if (applicationPage <= 1) {
                    return;
                }

                applicationPage -= 1;

                loadApplications();
            }
        );
    }


    if (applicationNextPage) {

        applicationNextPage.addEventListener(
            "click",
            () => {

                if (
                    applicationPage >=
                    applicationTotalPages
                ) {
                    return;
                }

                applicationPage += 1;

                loadApplications();
            }
        );
    }


    /* =====================================================
       APPLICATION DETAILS MODAL
       ===================================================== */

    const applicationDetailsModal =
        document.getElementById(
            "applicationDetailsModal"
        );

    const applicationDetailsBody =
        document.getElementById(
            "applicationDetailsBody"
        );

    const applicationModalClose =
        document.getElementById(
            "applicationModalClose"
        );

    const applicationModalCancel =
        document.getElementById(
            "applicationModalCancel"
        );

    const applicationModalOverlay =
        document.getElementById(
            "applicationModalOverlay"
        );


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    const closeApplicationModal = () => {

        if (!applicationDetailsModal) {
            return;
        }

        applicationDetailsModal.classList.remove(
            "is-open"
        );

        applicationDetailsModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    };


    /* =====================================================
       OPEN MODAL
       ===================================================== */

    const openApplicationModal = () => {

        if (!applicationDetailsModal) {
            return;
        }

        applicationDetailsModal.classList.add(
            "is-open"
        );

        applicationDetailsModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";
    };


    /* =====================================================
       APPLICATION STATUS OPTIONS
       ===================================================== */

    const applicationStatuses = [
        {
            value: "submitted",
            label: "Submitted"
        },
        {
            value: "under_review",
            label: "Under Review"
        },
        {
            value: "documents_required",
            label: "Documents Required"
        },
        {
            value: "application_sent",
            label: "Application Sent"
        },
        {
            value: "admission_received",
            label: "Admission Received"
        },
        {
            value: "visa_processing",
            label: "Visa Processing"
        },
        {
            value: "completed",
            label: "Completed"
        },
        {
            value: "rejected",
            label: "Rejected"
        }
    ];


    /* =====================================================
       RENDER APPLICATION DETAILS
       ===================================================== */

    const renderApplicationDetails = (
        application
    ) => {

        if (!applicationDetailsBody) {
            return;
        }


        const fullName =
            `${application.first_name || ""} ${application.last_name || ""}`
                .trim();


        const statusOptions =
            applicationStatuses
                .map((status) => {

                    return `
                        <option
                            value="${escapeHtml(
                                status.value
                            )}"
                            ${
                                application.status ===
                                status.value
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHtml(
                                status.label
                            )}
                        </option>
                    `;
                })
                .join("");


        applicationDetailsBody.innerHTML = `

            <!-- =========================================
                 APPLICATION HEADER
                 ========================================= -->

            <div class="admin-application-detail-header">

                <div class="admin-application-detail-identity">

                    <div class="admin-application-detail-avatar">
                        ${escapeHtml(
                            getInitials(
                                application.first_name,
                                application.last_name
                            )
                        )}
                    </div>

                    <div>

                        <span
                            style="
                                display:block;
                                font-size:10px;
                                font-weight:800;
                                letter-spacing:.12em;
                                text-transform:uppercase;
                                opacity:.45;
                            "
                        >
                            Application #${escapeHtml(
                                application.id
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                fullName ||
                                "Student"
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                application.email ||
                                "No email"
                            )}
                        </p>

                    </div>

                </div>


                <!-- STATUS CONTROL -->

                <div class="admin-application-status-control">

                    <label for="applicationStatusSelect">
                        Application Status
                    </label>

                    <select
                        id="applicationStatusSelect"
                    >
                        ${statusOptions}
                    </select>

                    <button
                        type="button"
                        id="saveApplicationStatus"
                        class="admin-primary-button"
                    >
                        Save Status
                    </button>

                </div>

            </div>


            <!-- =========================================
                 PERSONAL INFORMATION
                 ========================================= -->

            <div class="admin-detail-section">

                <h3 class="admin-detail-section-title">
                    Personal Information
                </h3>

                <div class="admin-detail-grid">

                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Full Name
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                fullName || "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Email
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.email ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Phone
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.phone ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Nationality
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.nationality ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            City
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.city ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Date of Birth
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                formatDate(
                                    application.date_of_birth
                                )
                            )}
                        </span>

                    </div>

                </div>

            </div>


            <!-- =========================================
                 ACADEMIC BACKGROUND
                 ========================================= -->

            <div class="admin-detail-section">

                <h3 class="admin-detail-section-title">
                    Academic Background
                </h3>

                <div class="admin-detail-grid">

                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Education Level
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.education_level ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Field of Study
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.field_of_study ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Institution
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.institution ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Graduation Year
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.graduation_year ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            GPA
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.gpa ||
                                "Not provided"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            English Level
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.english_level ||
                                "Not provided"
                            )}
                        </span>

                    </div>

                </div>

            </div>


            <!-- =========================================
                 STUDY PREFERENCES
                 ========================================= -->

            <div class="admin-detail-section">

                <h3 class="admin-detail-section-title">
                    Study Preferences
                </h3>

                <div class="admin-detail-grid">

                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Destination
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                formatCountry(
                                    application.preferred_country
                                )
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Study Level
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.study_level ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Preferred Field
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.preferred_field ||
                                "—"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Intake
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.intake ||
                                "Not specified"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Preferred University
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                application.preferred_university ||
                                "Not specified"
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Current Status
                        </span>

                        <span class="admin-detail-value">

                            <span
                                class="admin-status-badge admin-status-${escapeHtml(
                                    statusClass(
                                        application.status
                                    )
                                )}"
                            >
                                ${escapeHtml(
                                    formatStatus(
                                        application.status
                                    )
                                )}
                            </span>

                        </span>

                    </div>

                </div>

            </div>


            <!-- =========================================
                 STUDENT GOALS
                 ========================================= -->

            <div class="admin-detail-section">

                <h3 class="admin-detail-section-title">
                    Student Goals
                </h3>

                <div class="admin-detail-goals">

                    ${escapeHtml(
                        application.study_goals ||
                        "No study goals provided."
                    )}

                </div>

            </div>


            <!-- =========================================
                 APPLICATION RECORD
                 ========================================= -->

            <div class="admin-detail-section">

                <h3 class="admin-detail-section-title">
                    Application Record
                </h3>

                <div class="admin-detail-grid">

                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Application ID
                        </span>

                        <span class="admin-detail-value">
                            #${escapeHtml(
                                application.id
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Submitted
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                formatDate(
                                    application.created_at
                                )
                            )}

                            ${escapeHtml(
                                formatTime(
                                    application.created_at
                                )
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Last Updated
                        </span>

                        <span class="admin-detail-value">
                            ${escapeHtml(
                                formatDate(
                                    application.updated_at
                                )
                            )}

                            ${escapeHtml(
                                formatTime(
                                    application.updated_at
                                )
                            )}
                        </span>

                    </div>


                    <div class="admin-detail-item">

                        <span class="admin-detail-label">
                            Current Status
                        </span>

                        <span class="admin-detail-value">

                            <span
                                class="admin-status-badge admin-status-${escapeHtml(
                                    statusClass(
                                        application.status
                                    )
                                )}"
                            >
                                ${escapeHtml(
                                    formatStatus(
                                        application.status
                                    )
                                )}
                            </span>

                        </span>

                    </div>

                </div>

            </div>

        `;


        /* =================================================
           STATUS UPDATE
           ================================================= */

        const saveStatusButton =
            document.getElementById(
                "saveApplicationStatus"
            );

        const statusSelect =
            document.getElementById(
                "applicationStatusSelect"
            );


        if (
            saveStatusButton &&
            statusSelect
        ) {

            saveStatusButton.addEventListener(
                "click",
                async () => {

                    const newStatus =
                        statusSelect.value;


                    if (!newStatus) {
                        return;
                    }


                    const originalText =
                        saveStatusButton.textContent;


                    saveStatusButton.disabled =
                        true;

                    saveStatusButton.textContent =
                        "Saving...";


                    try {

                        const response =
                            await fetch(
                                `/api/admin/applications/${encodeURIComponent(
                                    application.id
                                )}/status`,
                                {
                                    method: "PATCH",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    credentials:
                                        "include",

                                    body:
                                        JSON.stringify({
                                            status:
                                                newStatus
                                        })
                                }
                            );


                        if (
                            response.status ===
                            401
                        ) {

                            window.location.href =
                                "./login.html";

                            return;
                        }


                        const data =
                            await response.json();


                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Unable to update application status."
                            );
                        }


                        /*
                         * Refresh table so the new status
                         * appears immediately.
                         */

                        await loadApplications();


                        /*
                         * Reload the application details
                         * so updated_at/current status are fresh.
                         */

                        await loadApplicationDetails(
                            application.id
                        );


                    } catch (error) {

                        console.error(
                            "Status update error:",
                            error
                        );


                        alert(
                            error.message ||
                            "Unable to update application status."
                        );


                        saveStatusButton.disabled =
                            false;

                        saveStatusButton.textContent =
                            originalText;
                    }
                }
            );
        }
    };


    /* =====================================================
       LOAD APPLICATION DETAILS
       ===================================================== */

    const loadApplicationDetails = async (
        applicationId
    ) => {

        if (!applicationId) {
            return;
        }


        if (applicationDetailsBody) {

            applicationDetailsBody.innerHTML = `
                <div class="admin-loading-state">

                    <div class="admin-loading-spinner"></div>

                    <p>
                        Loading application details...
                    </p>

                </div>
            `;
        }


        openApplicationModal();


        try {

            const response =
                await fetch(
                    `/api/admin/applications/${encodeURIComponent(
                        applicationId
                    )}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            if (response.status === 401) {

                window.location.href =
                    "./login.html";

                return;
            }


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load application."
                );
            }


            renderApplicationDetails(
                data.application
            );


        } catch (error) {

            console.error(
                "Application details error:",
                error
            );


            if (applicationDetailsBody) {

                applicationDetailsBody.innerHTML = `
                    <div class="admin-empty-state">

                        <div class="admin-empty-icon">
                            !
                        </div>

                        <h3>
                            Unable to load application
                        </h3>

                        <p>
                            ${escapeHtml(
                                error.message ||
                                "Please try again."
                            )}
                        </p>

                    </div>
                `;
            }
        }
    };


    /* =====================================================
       APPLICATION VIEW BUTTON
       ===================================================== */

    applicationsTableBody.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".admin-view-application-button"
                );


            if (!button) {
                return;
            }


            const applicationId =
                button.dataset.applicationId;


            loadApplicationDetails(
                applicationId
            );
        }
    );


    /* =====================================================
       MODAL EVENTS
       ===================================================== */

    if (applicationModalClose) {

        applicationModalClose.addEventListener(
            "click",
            closeApplicationModal
        );
    }


    if (applicationModalCancel) {

        applicationModalCancel.addEventListener(
            "click",
            closeApplicationModal
        );
    }


    if (applicationModalOverlay) {

        applicationModalOverlay.addEventListener(
            "click",
            closeApplicationModal
        );
    }


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                applicationDetailsModal &&
                applicationDetailsModal.classList.contains(
                    "is-open"
                )
            ) {
                closeApplicationModal();
            }
        }
    );


    /* =====================================================
       INITIAL APPLICATION LOAD
       ===================================================== */

    loadApplications();

});
/* =========================================================
   STUDENTS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const studentsPage =
        document.querySelector(
            "[data-admin-students]"
        );

    if (!studentsPage) return;

    initializeStudentsPage();
});


let studentsState = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    country: "",
    status: "",
    search: ""
};


/* =========================================================
   INITIALIZE STUDENTS
   ========================================================= */

function initializeStudentsPage() {

    const searchButton =
        document.getElementById(
            "studentSearchButton"
        );

    const searchInput =
        document.getElementById(
            "studentSearch"
        );

    const countryFilter =
        document.getElementById(
            "studentCountryFilter"
        );


    /* Search */

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                studentsState.search =
                    searchInput
                        ? searchInput.value.trim()
                        : "";

                studentsState.country =
                    countryFilter
                        ? countryFilter.value
                        : "";

                studentsState.page = 1;

                loadStudents();
            }
        );
    }


    /* Enter key */

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    if (searchButton) {
                        searchButton.click();
                    }
                }

            }
        );
    }


    /* Country filter */

    if (countryFilter) {

        countryFilter.addEventListener(
            "change",
            () => {

                studentsState.country =
                    countryFilter.value;

                studentsState.page = 1;

                loadStudents();
            }
        );
    }


    loadStudents();
}


/* =========================================================
   LOAD STUDENTS
   ========================================================= */

async function loadStudents() {

    const tableBody =
        document.getElementById(
            "studentsTableBody"
        );

    const emptyState =
        document.getElementById(
            "studentsEmptyState"
        );

    const loadingState =
        document.getElementById(
            "studentsLoadingState"
        );


    if (loadingState) {
        loadingState.hidden = false;
    }


    if (emptyState) {
        emptyState.hidden = true;
    }


    try {

        const params =
            new URLSearchParams();


        params.set(
            "page",
            studentsState.page
        );


        params.set(
            "limit",
            studentsState.limit
        );


        if (studentsState.country) {

            params.set(
                "country",
                studentsState.country
            );
        }


        if (studentsState.status) {

            params.set(
                "status",
                studentsState.status
            );
        }


        if (studentsState.search) {

            params.set(
                "search",
                studentsState.search
            );
        }


        const response =
            await fetch(
                `/api/admin/students?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "./login.html";

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load students."
            );
        }


        studentsState.total =
            Number(
                data.pagination?.total || 0
            );


        studentsState.totalPages =
            Math.max(
                Number(
                    data.pagination?.totalPages ||
                    1
                ),
                1
            );


        renderStudents(
            data.students || []
        );


    } catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="admin-table-error"
                    >
                        Unable to load students.
                    </td>
                </tr>
            `;
        }


    } finally {

        if (loadingState) {
            loadingState.hidden = true;
        }
    }
}


/* =========================================================
   RENDER STUDENTS
   ========================================================= */

function renderStudents(students) {

    const tableBody =
        document.getElementById(
            "studentsTableBody"
        );

    const emptyState =
        document.getElementById(
            "studentsEmptyState"
        );


    if (!tableBody) return;


    updateStudentCount(
        studentsState.total
    );


    if (!students.length) {

        tableBody.innerHTML = "";

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }


    if (emptyState) {
        emptyState.hidden = true;
    }


    tableBody.innerHTML =
        students.map((student) => {

            const fullName =
                `${student.first_name || ""} ${student.last_name || ""}`
                    .trim();


            return `
                <tr>

                    <!-- STUDENT -->

                    <td>

                        <div class="admin-applicant-cell">

                            <div class="admin-applicant-avatar">

                                ${escapeHtml(
                                    getInitials(
                                        student.first_name,
                                        student.last_name
                                    )
                                )}

                            </div>


                            <div>

                                <strong>
                                    ${escapeHtml(
                                        fullName ||
                                        "Student"
                                    )}
                                </strong>

                                <span>
                                    ${
                                        student.student_number
                                            ? escapeHtml(
                                                student.student_number
                                            )
                                            : `Student #${escapeHtml(
                                                student.id
                                            )}`
                                    }
                                </span>

                            </div>

                        </div>

                    </td>


                    <!-- CONTACT -->

                    <td>

                        <div class="admin-contact-cell">

                            <strong>
                                ${escapeHtml(
                                    student.email ||
                                    "—"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    student.phone ||
                                    "—"
                                )}
                            </span>

                        </div>

                    </td>


                    <!-- DESTINATION -->

                    <td>

                        <span
                            class="admin-destination-cell"
                        >
                            ${escapeHtml(
                                formatCountry(
                                    student.preferred_country
                                )
                            )}
                        </span>

                    </td>


                    <!-- STUDY -->

                    <td>

                        <div class="admin-study-cell">

                            <strong>
                                ${escapeHtml(
                                    student.study_level ||
                                    "—"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    student.preferred_field ||
                                    "—"
                                )}
                            </span>

                        </div>

                    </td>


                    <!-- STATUS -->

                    <td>

                        <span
                            class="admin-status-badge status-${escapeHtml(
                                statusClass(
                                    student.status
                                )
                            )}"
                        >
                            ${escapeHtml(
                                formatStudentStatus(
                                    student.status
                                )
                            )}
                        </span>

                    </td>


                    <!-- ACTION -->

                    <td>

                        <button
                            type="button"
                            class="admin-view-button"
                            data-view-student="${escapeHtml(
                                student.id
                            )}"
                        >
                            View
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    /* View buttons */

    tableBody
        .querySelectorAll(
            "[data-view-student]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.getAttribute(
                            "data-view-student"
                        );

                    openStudentDetails(id);
                }
            );

        });
}


/* =========================================================
   STUDENT COUNT
   ========================================================= */

function updateStudentCount(count) {

    const element =
        document.getElementById(
            "studentCount"
        );


    if (!element) return;


    element.textContent =
        Number(count || 0)
            .toLocaleString();
}


/* =========================================================
   STUDENT STATUS LABEL
   ========================================================= */

function formatStudentStatus(status) {

    const labels = {

        active:
            "Active",

        admission_received:
            "Admission Received",

        visa_processing:
            "Visa Processing",

        enrolled:
            "Enrolled",

        completed:
            "Completed",

        inactive:
            "Inactive"
    };


    return (
        labels[status] ||
        status ||
        "Unknown"
    );
}


/* =========================================================
   OPEN STUDENT DETAILS
   ========================================================= */

async function openStudentDetails(id) {

    try {

        const response =
            await fetch(
                `/api/admin/students/${encodeURIComponent(id)}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "./login.html";

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load student."
            );
        }


        const student =
            data.student;


        alert(
            `Student: ${student.first_name || ""} ${student.last_name || ""}\n` +
            `Email: ${student.email || "—"}\n` +
            `Destination: ${formatCountry(student.preferred_country)}\n` +
            `Status: ${formatStudentStatus(student.status)}`
        );


    } catch (error) {

        console.error(
            "STUDENT DETAILS ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to load student."
        );
    }
}
