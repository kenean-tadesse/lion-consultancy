"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       LION CONSULTANCY
       ADMIN CONSULTATION INQUIRIES
       FRONTEND CONTROLLER
    ========================================================= */

    const API_BASE_URL =
        window.location.port === "5500"
            ? "http://localhost:5000"
            : "";

    const API_URL =
        `${API_BASE_URL}/api/admin/inquiries`;

    /* =========================================================
       STATE
    ========================================================= */

    let inquiries = [];
    let filteredInquiries = [];

    let currentPage = 1;
    const itemsPerPage = 8;

    let activePipeline = "all";

    /* =========================================================
       DOM ELEMENTS
    ========================================================= */

    const inquiryTotal =
        document.getElementById("inquiryTotal");

    const inquiryNew =
        document.getElementById("inquiryNew");

    const inquiryFollowup =
        document.getElementById("inquiryFollowup");

    const inquiryPriority =
        document.getElementById("inquiryPriority");

    const inquiryConverted =
        document.getElementById("inquiryConverted");

    const inquirySearch =
        document.getElementById("inquirySearch");

    const inquiryStatusFilter =
        document.getElementById("inquiryStatusFilter");

    const inquiryPriorityFilter =
        document.getElementById("inquiryPriorityFilter");

    const inquiryCountryFilter =
        document.getElementById("inquiryCountryFilter");

    const inquirySort =
        document.getElementById("inquirySort");

    const inquiriesTableBody =
        document.getElementById("inquiriesTableBody");

    const inquiryPaginationInfo =
        document.getElementById("inquiryPaginationInfo");

    const inquiryPaginationControls =
        document.getElementById("inquiryPaginationControls");

    const inquiryDrawerOverlay =
        document.getElementById("inquiryDrawerOverlay");

    const inquiryDrawer =
        document.getElementById("inquiryDrawer");

    const closeInquiryDrawer =
        document.getElementById("closeInquiryDrawer");

    const inquiryDrawerContent =
        document.getElementById("inquiryDrawerContent");

    const addInquiryButton =
        document.getElementById("addInquiryButton");

    const inquiryModalOverlay =
        document.getElementById("inquiryModalOverlay");

    const inquiryModalTitle =
        document.getElementById("inquiryModalTitle");

    const closeInquiryModal =
        document.getElementById("closeInquiryModal");

    const cancelInquiryButton =
        document.getElementById("cancelInquiryButton");

    const inquiryForm =
        document.getElementById("inquiryForm");

    const inquiryId =
        document.getElementById("inquiryId");

    const inquiryName =
        document.getElementById("inquiryName");

    const inquiryEmail =
        document.getElementById("inquiryEmail");

    const inquiryPhone =
        document.getElementById("inquiryPhone");

    const inquiryCountry =
        document.getElementById("inquiryCountry");

    const inquiryDestination =
        document.getElementById("inquiryDestination");

    const inquiryStudyLevel =
        document.getElementById("inquiryStudyLevel");

    const inquiryPriorityInput =
        document.getElementById("inquiryPriority");

    const inquiryStatusInput =
        document.getElementById("inquiryStatus");

    const inquirySubject =
        document.getElementById("inquirySubject");

    const inquiryMessage =
        document.getElementById("inquiryMessage");

    const inquiryNotes =
        document.getElementById("inquiryNotes");

    const inquiryAssigned =
        document.getElementById("inquiryAssigned");

    const inquirySource =
        document.getElementById("inquirySource");

    /* =========================================================
       HELPERS
    ========================================================= */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    function formatDateTime(value) {

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );
    }

    function formatStatus(status) {

        if (!status) {
            return "New";
        }

        return String(status)
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                letter => letter.toUpperCase()
            );
    }

    function formatPriority(priority) {

        if (!priority) {
            return "Normal";
        }

        return String(priority)
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                letter => letter.toUpperCase()
            );
    }

    function getInitials(name) {

        if (!name) {
            return "IN";
        }

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(
                word =>
                    word
                        .charAt(0)
                        .toUpperCase()
            )
            .join("");
    }

    function showError(message) {

        console.error(
            "INQUIRY ERROR:",
            message
        );

        if (
            typeof window.showAdminToast ===
            "function"
        ) {
            window.showAdminToast(
                message,
                "error"
            );
            return;
        }

        alert(message);
    }

    function showSuccess(message) {

        if (
            typeof window.showAdminToast ===
            "function"
        ) {
            window.showAdminToast(
                message,
                "success"
            );
            return;
        }

        console.log(
            "INQUIRY SUCCESS:",
            message
        );
    }

    /* =========================================================
       API REQUEST
    ========================================================= */

    async function apiRequest(
        url,
        options = {}
    ) {

        const response = await fetch(
            url,
            {
                credentials: "include",
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );

        let result = {};

        try {
            result = await response.json();
        } catch {
            result = {};
        }

        if (!response.ok) {

            throw new Error(
                result.message ||
                `Request failed with status ${response.status}`
            );
        }

        return result;
    }

    /* =========================================================
       LOAD INQUIRIES
    ========================================================= */

    async function loadInquiries() {

        if (!inquiriesTableBody) {
            return;
        }

        inquiriesTableBody.innerHTML = `
            <tr>
                <td
                    colspan="100%"
                    class="admin-loading-state"
                >
                    Loading consultation inquiries...
                </td>
            </tr>
        `;

        try {

            const response =
                await apiRequest(
                    `${API_URL}?page=1&limit=100&sort=newest`
                );

            console.log(
                "INQUIRIES API RESPONSE:",
                response
            );

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to load inquiries."
                );
            }

            inquiries =
                Array.isArray(
                    response.inquiries
                )
                    ? response.inquiries
                    : [];

            filteredInquiries =
                [...inquiries];

            currentPage = 1;

            populateCountryFilter();

            applyFilters();

        } catch (error) {

            console.error(
                "Failed to load inquiries:",
                error
            );

            inquiries = [];
            filteredInquiries = [];

            inquiriesTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="100%"
                        class="admin-empty-state"
                    >
                        <strong>
                            Unable to load inquiries
                        </strong>

                        <br>

                        <span>
                            ${escapeHtml(
                                error.message
                            )}
                        </span>
                    </td>
                </tr>
            `;

            updateStats();
            updatePagination();
        }
    }

    /* =========================================================
       COUNTRY FILTER
    ========================================================= */

    function populateCountryFilter() {

        if (!inquiryCountryFilter) {
            return;
        }

        const currentValue =
            inquiryCountryFilter.value ||
            "all";

        const countries = [
            ...new Set(
                inquiries
                    .map(
                        inquiry =>
                            inquiry.country
                    )
                    .filter(Boolean)
            )
        ].sort();

        inquiryCountryFilter.innerHTML = `
            <option value="all">
                All countries
            </option>

            ${countries
                .map(
                    country => `
                        <option value="${escapeHtml(
                            country
                        )}">
                            ${escapeHtml(
                                country
                            )}
                        </option>
                    `
                )
                .join("")}
        `;

        if (
            countries.includes(
                currentValue
            )
        ) {

            inquiryCountryFilter.value =
                currentValue;

        } else {

            inquiryCountryFilter.value =
                "all";
        }
    }

    /* =========================================================
       FILTERS
    ========================================================= */

    function applyFilters() {

        const search =
            inquirySearch?.value
                ?.trim()
                .toLowerCase() || "";

        const status =
            inquiryStatusFilter?.value ||
            "all";

        const priority =
            inquiryPriorityFilter?.value ||
            "all";

        const country =
            inquiryCountryFilter?.value ||
            "all";

        filteredInquiries =
            inquiries.filter(
                inquiry => {

                    const searchableFields = [
                        inquiry.name,
                        inquiry.email,
                        inquiry.phone,
                        inquiry.country,
                        inquiry.destination,
                        inquiry.subject,
                        inquiry.message
                    ];

                    const matchesSearch =
                        !search ||
                        searchableFields
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            search
                                        )
                            );

                    const matchesStatus =
                        status === "all" ||
                        inquiry.status === status;

                    const matchesPriority =
                        priority === "all" ||
                        inquiry.priority ===
                            priority;

                    const matchesCountry =
                        country === "all" ||
                        inquiry.country ===
                            country;

                    const matchesPipeline =
                        activePipeline ===
                            "all" ||
                        inquiry.status ===
                            activePipeline;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority &&
                        matchesCountry &&
                        matchesPipeline
                    );
                }
            );

        sortInquiries();

        currentPage = 1;

        renderTable();
        updateStats();
        updatePagination();
    }

    /* =========================================================
       SORT
    ========================================================= */

    function sortInquiries() {

        const sort =
            inquirySort?.value ||
            "newest";

        filteredInquiries.sort(
            (a, b) => {

                if (sort === "oldest") {

                    return (
                        new Date(
                            a.created_at || 0
                        ) -
                        new Date(
                            b.created_at || 0
                        )
                    );
                }

                if (sort === "priority") {

                    const priorityOrder = {
                        urgent: 1,
                        high: 2,
                        normal: 3,
                        low: 4
                    };

                    return (
                        (
                            priorityOrder[
                                a.priority
                            ] || 99
                        ) -
                        (
                            priorityOrder[
                                b.priority
                            ] || 99
                        )
                    );
                }

                if (sort === "unread") {

                    return (
                        Number(b.unread) -
                        Number(a.unread)
                    );
                }

                return (
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
                );
            }
        );
    }

    /* =========================================================
       RENDER TABLE
    ========================================================= */

    function renderTable() {

        if (!inquiriesTableBody) {
            return;
        }

        if (!filteredInquiries.length) {

            inquiriesTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="100%"
                        class="admin-empty-state"
                    >
                        <strong>
                            No consultation inquiries found
                        </strong>

                        <br>

                        <span>
                            Try changing your
                            search or filters.
                        </span>
                    </td>
                </tr>
            `;

            return;
        }

        const start =
            (currentPage - 1) *
            itemsPerPage;

        const end =
            start + itemsPerPage;

        const pageItems =
            filteredInquiries.slice(
                start,
                end
            );

        inquiriesTableBody.innerHTML =
            pageItems
                .map(
                    inquiry => {

                        const unreadClass =
                            Number(
                                inquiry.unread
                            ) === 1
                                ? "inquiry-unread"
                                : "";

                        return `
                            <tr
                                class="${unreadClass}"
                                data-inquiry-id="${escapeHtml(
                                    inquiry.id
                                )}"
                            >

                                <td>
                                    <div class="inquiry-person">

                                        <div class="inquiry-avatar">
                                            ${escapeHtml(
                                                getInitials(
                                                    inquiry.name
                                                )
                                            )}
                                        </div>

                                        <div>

                                            <strong>
                                                ${escapeHtml(
                                                    inquiry.name ||
                                                    "Unknown"
                                                )}
                                            </strong>

                                            <span>
                                                ${escapeHtml(
                                                    inquiry.email ||
                                                    "—"
                                                )}
                                            </span>

                                        </div>

                                    </div>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        inquiry.destination ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        inquiry.country ||
                                        "—"
                                    )}
                                </td>

                                <td>

                                    <span
                                        class="inquiry-status status-${escapeHtml(
                                            inquiry.status ||
                                            "new"
                                        )}"
                                    >
                                        ${escapeHtml(
                                            formatStatus(
                                                inquiry.status
                                            )
                                        )}
                                    </span>

                                </td>

                                <td>

                                    <span
                                        class="inquiry-priority priority-${escapeHtml(
                                            inquiry.priority ||
                                            "normal"
                                        )}"
                                    >
                                        ${escapeHtml(
                                            formatPriority(
                                                inquiry.priority
                                            )
                                        )}
                                    </span>

                                </td>

                                <td>
                                    ${escapeHtml(
                                        formatDate(
                                            inquiry.created_at
                                        )
                                    )}
                                </td>

                                <td>

                                    <div class="inquiry-actions">

                                        <button
                                            type="button"
                                            class="inquiry-action-btn"
                                            data-action="view"
                                            data-id="${escapeHtml(
                                                inquiry.id
                                            )}"
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            class="inquiry-action-btn"
                                            data-action="edit"
                                            data-id="${escapeHtml(
                                                inquiry.id
                                            )}"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            class="inquiry-action-btn danger"
                                            data-action="delete"
                                            data-id="${escapeHtml(
                                                inquiry.id
                                            )}"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");
    }

    /* =========================================================
       STATISTICS
    ========================================================= */

    function updateStats() {

        const total =
            inquiries.length;

        const newCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status === "new"
            ).length;

        const followupCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status ===
                    "followup"
            ).length;

        const priorityCount =
            inquiries.filter(
                inquiry =>
                    inquiry.priority ===
                        "urgent" ||
                    inquiry.priority ===
                        "high"
            ).length;

        const convertedCount =
            inquiries.filter(
                inquiry =>
                    inquiry.status ===
                    "converted"
            ).length;

        if (inquiryTotal) {
            inquiryTotal.textContent =
                total;
        }

        if (inquiryNew) {
            inquiryNew.textContent =
                newCount;
        }

        if (inquiryFollowup) {
            inquiryFollowup.textContent =
                followupCount;
        }

        if (inquiryPriority) {
            inquiryPriority.textContent =
                priorityCount;
        }

        if (inquiryConverted) {
            inquiryConverted.textContent =
                convertedCount;
        }

        updatePipelineCounts();
    }

    /* =========================================================
       PIPELINE COUNTS
    ========================================================= */

    function updatePipelineCounts() {

        document
            .querySelectorAll(
                "[data-pipeline]"
            )
            .forEach(button => {

                const pipeline =
                    button.dataset.pipeline;

                const count =
                    pipeline === "all"
                        ? inquiries.length
                        : inquiries.filter(
                            inquiry =>
                                inquiry.status ===
                                pipeline
                        ).length;

                const countElement =
                    button.querySelector(
                        "[data-pipeline-count]"
                    );

                if (countElement) {

                    countElement.textContent =
                        count;
                }
            });
    }

    /* =========================================================
       PAGINATION
    ========================================================= */

    function updatePagination() {

        const total =
            filteredInquiries.length;

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total /
                    itemsPerPage
                )
            );

        if (
            currentPage >
            totalPages
        ) {
            currentPage =
                totalPages;
        }

        const start =
            total === 0
                ? 0
                : (
                    (currentPage - 1) *
                    itemsPerPage
                ) + 1;

        const end =
            Math.min(
                currentPage *
                    itemsPerPage,
                total
            );

        if (inquiryPaginationInfo) {

            inquiryPaginationInfo.textContent =
                total === 0
                    ? "Showing 0 of 0"
                    : `Showing ${start}-${end} of ${total}`;
        }

        if (
            !inquiryPaginationControls
        ) {
            return;
        }

        inquiryPaginationControls.innerHTML =
            "";

        if (totalPages <= 1) {
            return;
        }

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                page === currentPage
                    ? "active"
                    : "";

            button.textContent =
                page;

            button.addEventListener(
                "click",
                () => {

                    currentPage =
                        page;

                    renderTable();
                    updatePagination();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            );

            inquiryPaginationControls
                .appendChild(
                    button
                );
        }
    }

    /* =========================================================
       DRAWER
    ========================================================= */

    function openDrawer(inquiry) {

        if (
            !inquiryDrawerOverlay ||
            !inquiryDrawer
        ) {
            return;
        }

        if (inquiryDrawerContent) {

            inquiryDrawerContent.innerHTML = `
                <div class="inquiry-detail-header">

                    <div class="inquiry-detail-avatar">
                        ${escapeHtml(
                            getInitials(
                                inquiry.name
                            )
                        )}
                    </div>

                    <div>

                        <h3>
                            ${escapeHtml(
                                inquiry.name ||
                                "Unknown"
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                inquiry.email ||
                                "—"
                            )}
                        </p>

                    </div>

                </div>

                <div class="inquiry-detail-grid">

                    <div>
                        <span>Phone</span>
                        <strong>
                            ${escapeHtml(
                                inquiry.phone ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Country</span>
                        <strong>
                            ${escapeHtml(
                                inquiry.country ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Destination</span>
                        <strong>
                            ${escapeHtml(
                                inquiry.destination ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Study Level</span>
                        <strong>
                            ${escapeHtml(
                                inquiry.study_level ||
                                inquiry.studyLevel ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>
                            ${escapeHtml(
                                formatStatus(
                                    inquiry.status
                                )
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Priority</span>
                        <strong>
                            ${escapeHtml(
                                formatPriority(
                                    inquiry.priority
                                )
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Source</span>
                        <strong>
                            ${escapeHtml(
                                inquiry.source ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Created</span>
                        <strong>
                            ${escapeHtml(
                                formatDateTime(
                                    inquiry.created_at
                                )
                            )}
                        </strong>
                    </div>

                </div>

                <div class="inquiry-detail-section">

                    <span>Subject</span>

                    <h4>
                        ${escapeHtml(
                            inquiry.subject ||
                            "No subject"
                        )}
                    </h4>

                </div>

                <div class="inquiry-detail-section">

                    <span>Message</span>

                    <p>
                        ${escapeHtml(
                            inquiry.message ||
                            "No message provided."
                        )}
                    </p>

                </div>

                <div class="inquiry-detail-section">

                    <span>Notes</span>

                    <p>
                        ${escapeHtml(
                            inquiry.notes ||
                            "No notes."
                        )}
                    </p>

                </div>

                <div class="inquiry-detail-section">

                    <span>Assigned To</span>

                    <p>
                        ${escapeHtml(
                            inquiry.assigned ||
                            "Unassigned"
                        )}
                    </p>

                </div>
            `;
        }

        inquiryDrawerOverlay
            .classList.add("active");

        inquiryDrawer
            .classList.add("active");

        document.body.classList.add(
            "inquiry-drawer-open"
        );
    }

    function closeDrawer() {

        inquiryDrawerOverlay
            ?.classList.remove("active");

        inquiryDrawer
            ?.classList.remove("active");

        document.body.classList.remove(
            "inquiry-drawer-open"
        );
    }

    /* =========================================================
       MARK AS READ
    ========================================================= */

    async function markAsRead(id) {

        try {

            const response =
                await apiRequest(
                    `${API_URL}/${encodeURIComponent(
                        id
                    )}/read`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            isRead: true
                        })
                    }
                );

            if (response.success) {

                const inquiry =
                    inquiries.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );

                if (inquiry) {
                    inquiry.unread = 0;
                    inquiry.is_read = 1;
                }
            }

        } catch (error) {

            console.warn(
                "Could not mark inquiry as read:",
                error.message
            );
        }
    }

    /* =========================================================
       VIEW
    ========================================================= */

    async function viewInquiry(id) {

        const inquiry =
            inquiries.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!inquiry) {
            return;
        }

        openDrawer(inquiry);

        if (
            Number(inquiry.unread) ===
            1
        ) {

            inquiry.unread = 0;

            renderTable();

            await markAsRead(id);
        }
    }

    /* =========================================================
       MODAL
    ========================================================= */

    function openModal(
        inquiry = null
    ) {

        if (
            !inquiryModalOverlay ||
            !inquiryForm
        ) {
            return;
        }

        inquiryForm.reset();

        if (inquiry) {

            if (inquiryModalTitle) {
                inquiryModalTitle.textContent =
                    "Edit Consultation Inquiry";
            }

            inquiryId.value =
                inquiry.id || "";

            inquiryName.value =
                inquiry.name || "";

            inquiryEmail.value =
                inquiry.email || "";

            inquiryPhone.value =
                inquiry.phone || "";

            inquiryCountry.value =
                inquiry.country || "";

            inquiryDestination.value =
                inquiry.destination || "";

            inquiryStudyLevel.value =
                inquiry.study_level ||
                inquiry.studyLevel ||
                "";

            inquiryPriorityInput.value =
                inquiry.priority ||
                "normal";

            inquiryStatusInput.value =
                inquiry.status ||
                "new";

            inquirySubject.value =
                inquiry.subject || "";

            inquiryMessage.value =
                inquiry.message || "";

            inquiryNotes.value =
                inquiry.notes || "";

            inquiryAssigned.value =
                inquiry.assigned || "";

            inquirySource.value =
                inquiry.source || "website";

        } else {

            if (inquiryModalTitle) {
                inquiryModalTitle.textContent =
                    "Add Consultation Inquiry";
            }

            inquiryId.value = "";

            inquiryPriorityInput.value =
                "normal";

            inquiryStatusInput.value =
                "new";

            inquirySource.value =
                "admin";
        }

        inquiryModalOverlay
            .classList.add("active");

        document.body.classList.add(
            "inquiry-modal-open"
        );
    }

    function closeModal() {

        inquiryModalOverlay
            ?.classList.remove("active");

        document.body.classList.remove(
            "inquiry-modal-open"
        );
    }

    /* =========================================================
       SAVE
    ========================================================= */

    async function saveInquiry(event) {

        event.preventDefault();

        const id =
            inquiryId.value.trim();

        const payload = {

            name:
                inquiryName.value.trim(),

            email:
                inquiryEmail.value.trim(),

            phone:
                inquiryPhone.value.trim(),

            country:
                inquiryCountry.value.trim(),

            destination:
                inquiryDestination.value.trim(),

            studyLevel:
                inquiryStudyLevel.value.trim(),

            priority:
                inquiryPriorityInput.value,

            status:
                inquiryStatusInput.value,

            subject:
                inquirySubject.value.trim(),

            message:
                inquiryMessage.value.trim(),

            notes:
                inquiryNotes.value.trim(),

            assigned:
                inquiryAssigned.value.trim(),

            source:
                inquirySource.value.trim() ||
                "admin"
        };

        try {

            let response;

            if (id) {

                response =
                    await apiRequest(
                        `${API_URL}/${encodeURIComponent(
                            id
                        )}`,
                        {
                            method: "PATCH",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            } else {

                response =
                    await apiRequest(
                        API_URL,
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );
            }

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to save inquiry."
                );
            }

            closeModal();

            showSuccess(
                id
                    ? "Inquiry updated successfully."
                    : "Inquiry created successfully."
            );

            await loadInquiries();

        } catch (error) {

            console.error(
                "Save inquiry failed:",
                error
            );

            showError(
                error.message ||
                "Unable to save inquiry."
            );
        }
    }

    /* =========================================================
       DELETE
    ========================================================= */

    async function deleteInquiry(id) {

        const inquiry =
            inquiries.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!inquiry) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete the inquiry from "${inquiry.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            const response =
                await apiRequest(
                    `${API_URL}/${encodeURIComponent(
                        id
                    )}`,
                    {
                        method: "DELETE"
                    }
                );

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to delete inquiry."
                );
            }

            showSuccess(
                "Inquiry deleted successfully."
            );

            await loadInquiries();

        } catch (error) {

            console.error(
                "Delete inquiry failed:",
                error
            );

            showError(
                error.message ||
                "Unable to delete inquiry."
            );
        }
    }

    /* =========================================================
       TABLE ACTIONS
    ========================================================= */

    inquiriesTableBody?.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) {
                return;
            }

            const id =
                button.dataset.id;

            const action =
                button.dataset.action;

            if (!id) {
                return;
            }

            if (action === "view") {

                await viewInquiry(id);

                return;
            }

            if (action === "edit") {

                const inquiry =
                    inquiries.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );

                if (inquiry) {
                    openModal(inquiry);
                }

                return;
            }

            if (action === "delete") {

                await deleteInquiry(id);
            }
        }
    );

    /* =========================================================
       PIPELINE
    ========================================================= */

    document
        .querySelectorAll(
            "[data-pipeline]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    activePipeline =
                        button.dataset.pipeline ||
                        "all";

                    document
                        .querySelectorAll(
                            "[data-pipeline]"
                        )
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );
                        });

                    button.classList.add(
                        "active"
                    );

                    applyFilters();
                }
            );
        });

    /* =========================================================
       SEARCH / FILTERS
    ========================================================= */

    inquirySearch?.addEventListener(
        "input",
        applyFilters
    );

    inquiryStatusFilter?.addEventListener(
        "change",
        applyFilters
    );

    inquiryPriorityFilter?.addEventListener(
        "change",
        applyFilters
    );

    inquiryCountryFilter?.addEventListener(
        "change",
        applyFilters
    );

    inquirySort?.addEventListener(
        "change",
        () => {

            sortInquiries();

            renderTable();

            updatePagination();
        }
    );

    /* =========================================================
       ADD
    ========================================================= */

    addInquiryButton?.addEventListener(
        "click",
        () => openModal()
    );

    closeInquiryModal?.addEventListener(
        "click",
        closeModal
    );

    cancelInquiryButton?.addEventListener(
        "click",
        closeModal
    );

    inquiryModalOverlay?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                inquiryModalOverlay
            ) {
                closeModal();
            }
        }
    );

    inquiryForm?.addEventListener(
        "submit",
        saveInquiry
    );

    /* =========================================================
       DRAWER
    ========================================================= */

    closeInquiryDrawer?.addEventListener(
        "click",
        closeDrawer
    );

    inquiryDrawerOverlay?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                inquiryDrawerOverlay
            ) {
                closeDrawer();
            }
        }
    );

    /* =========================================================
       ESCAPE
    ========================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            closeDrawer();
            closeModal();
        }
    );

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    loadInquiries();

});