/* =========================================================
   LION CONSULTANCY
   MAIN JAVASCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_BASE_URL =
    window.location.port === "5500"
        ? "http://localhost:5000"
        : "";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GLOBAL ELEMENTS
       ===================================================== */

    const loader =
        document.getElementById("siteLoader");

    const header =
        document.getElementById("siteHeader");

    const menuToggle =
        document.getElementById("menuToggle");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const cursorGlow =
        document.getElementById("cursorGlow");

    const currentYear =
        document.getElementById("currentYear");


    /* =====================================================
       PAGE LOADER
       ===================================================== */

    function hideLoader() {

        if (!loader) {
            return;
        }

        loader.classList.add("loaded");

        setTimeout(() => {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            loader.style.pointerEvents = "none";

        }, 500);

        setTimeout(() => {

            loader.style.display = "none";

        }, 1100);
    }


    window.addEventListener("load", () => {

        setTimeout(hideLoader, 500);

    });


    /* Safety fallback */

    setTimeout(hideLoader, 2500);


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       HEADER SCROLL EFFECT
       ===================================================== */

    function handleHeaderScroll() {

        if (!header) {
            return;
        }

        if (window.scrollY > 40) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }
    }


    window.addEventListener(
        "scroll",
        handleHeaderScroll,
        { passive: true }
    );


    handleHeaderScroll();


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (menuToggle && mobileMenu) {

        menuToggle.addEventListener(
            "click",
            () => {

                menuToggle.classList.toggle("active");

                mobileMenu.classList.toggle("active");

                const isOpen =
                    mobileMenu.classList.contains("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );

                document.body.classList.toggle(
                    "menu-open",
                    isOpen
                );

            }
        );


        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        menuToggle.classList.remove(
                            "active"
                        );

                        mobileMenu.classList.remove(
                            "active"
                        );

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        document.body.classList.remove(
                            "menu-open"
                        );

                    }
                );

            });

    }


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        this.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#" ||
                        targetId.length < 2
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;

                    const targetPosition =
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });

                }
            );

        });


    /* =====================================================
       CURSOR GLOW
       ===================================================== */

    if (
        cursorGlow &&
        window.matchMedia("(pointer: fine)").matches
    ) {

        let mouseX = 0;
        let mouseY = 0;

        let glowX = 0;
        let glowY = 0;


        document.addEventListener(
            "mousemove",
            event => {

                mouseX = event.clientX;
                mouseY = event.clientY;

            }
        );


        function animateCursor() {

            glowX +=
                (mouseX - glowX) * 0.12;

            glowY +=
                (mouseY - glowY) * 0.12;

            cursorGlow.style.transform =
                `translate3d(
                    ${glowX}px,
                    ${glowY}px,
                    0
                )`;

            requestAnimationFrame(
                animateCursor
            );
        }


        animateCursor();
    }


    /* =====================================================
       HERO ORBIT
       ===================================================== */

    const orbitSystem =
        document.getElementById("orbitSystem");


    if (orbitSystem) {

        let targetRotateX = 0;
        let targetRotateY = 0;

        let currentRotateX = 0;
        let currentRotateY = 0;


        document.addEventListener(
            "mousemove",
            event => {

                const x =
                    event.clientX /
                    window.innerWidth -
                    0.5;

                const y =
                    event.clientY /
                    window.innerHeight -
                    0.5;

                targetRotateY =
                    x * 10;

                targetRotateX =
                    y * -8;

            }
        );


        function animateOrbit() {

            currentRotateX +=
                (
                    targetRotateX -
                    currentRotateX
                ) * 0.04;

            currentRotateY +=
                (
                    targetRotateY -
                    currentRotateY
                ) * 0.04;


            orbitSystem.style.transform =
                `rotateX(${currentRotateX}deg)
                 rotateY(${currentRotateY}deg)`;


            requestAnimationFrame(
                animateOrbit
            );
        }


        animateOrbit();
    }


    /* =====================================================
       PLANE ORBIT
       ===================================================== */

    const planeOrbit =
        document.getElementById("planeOrbit");


    if (planeOrbit) {

        let rotation = 0;


        function animatePlane() {

            rotation += 0.18;

            planeOrbit.style.transform =
                `rotate(${rotation}deg)`;

            requestAnimationFrame(
                animatePlane
            );
        }


        animatePlane();
    }


    /* =====================================================
       SCROLL REVEAL
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            `
            .destination-card,
            .service-item,
            .journey-step,
            .trust-card,
            .featured-panel,
            .section-heading,
            .hero-content,
            .hero-visual
            `
        );


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "revealed"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -60px 0px"
                }
            );


        revealElements.forEach(element => {

            element.classList.add("reveal");

            revealObserver.observe(
                element
            );

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add(
                "revealed"
            );

        });

    }


    /* =====================================================
       CONTACT / CONSULTATION INQUIRY FORM
       ===================================================== */

    const contactForm =
        document.getElementById("contactForm");

    const formMessage =
        document.getElementById("formMessage");


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const submitButton =
                    contactForm.querySelector(
                        'button[type="submit"]'
                    );


                const formData =
                    new FormData(contactForm);


                const name =
                    String(
                        formData.get("name") || ""
                    ).trim();


                const email =
                    String(
                        formData.get("email") || ""
                    ).trim();


                const phone =
                    String(
                        formData.get("phone") || ""
                    ).trim();


                const destination =
                    String(
                        formData.get("destination") ||
                        ""
                    ).trim();


                const message =
                    String(
                        formData.get("message") ||
                        ""
                    ).trim();


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                /* =========================================
                   VALIDATION
                   ========================================= */

                if (!name || !email) {

                    if (formMessage) {

                        formMessage.textContent =
                            "Please enter your full name and email address.";

                        formMessage.classList.add(
                            "show"
                        );
                    }

                    return;
                }


                if (!emailPattern.test(email)) {

                    if (formMessage) {

                        formMessage.textContent =
                            "Please enter a valid email address.";

                        formMessage.classList.add(
                            "show"
                        );
                    }

                    return;
                }


                /* =========================================
                   BUTTON LOADING
                   ========================================= */

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.dataset.originalText =
                        submitButton.textContent.trim();

                    submitButton.textContent =
                        "Sending Inquiry...";
                }


                if (formMessage) {

                    formMessage.classList.remove(
                        "show"
                    );

                    formMessage.textContent = "";
                }


                /* =========================================
                   SEND TO BACKEND
                   ========================================= */

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/inquiries`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    name: name,

                                    email: email,

                                    phone: phone,

                                    country: "",

                                    destination:
                                        destination,

                                    studyLevel: "",

                                    priority:
                                        "normal",

                                    status:
                                        "new",

                                    subject:
                                        "Website consultation inquiry",

                                    message:
                                        message,

                                    notes: "",

                                    assignedTo: "",

                                    source:
                                        "website"

                                })
                            }
                        );


                    const result =
                        await response
                            .json()
                            .catch(() => ({}));


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Unable to send your inquiry. Please try again."
                        );

                    }


                    /* =====================================
                       SUCCESS
                       ===================================== */

                    if (formMessage) {

                        formMessage.textContent =
                            "Thank you. Your inquiry has been received successfully. Our consultancy team will contact you soon.";

                        formMessage.classList.add(
                            "show"
                        );
                    }


                    contactForm.reset();


                    console.log(
                        "Consultation inquiry submitted:",
                        result
                    );


                } catch (error) {

                    console.error(
                        "Contact inquiry submission error:",
                        error
                    );


                    if (formMessage) {

                        formMessage.textContent =
                            error.message ||
                            "Something went wrong. Please try again.";

                        formMessage.classList.add(
                            "show"
                        );
                    }


                } finally {

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            submitButton.dataset.originalText ||
                            "Send Inquiry";
                    }
                }

            }
        );
    }


    /* =====================================================
       DESTINATION CARD 3D EFFECT
       ===================================================== */

    document
        .querySelectorAll(".destination-card")
        .forEach(card => {

            card.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        card.getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left;


                    const y =
                        event.clientY -
                        rect.top;


                    const centerX =
                        rect.width / 2;


                    const centerY =
                        rect.height / 2;


                    const rotateX =
                        (
                            (y - centerY) /
                            centerY
                        ) * -3;


                    const rotateY =
                        (
                            (x - centerX) /
                            centerX
                        ) * 3;


                    card.style.transform =
                        `perspective(1000px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-6px)`;

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform = "";

                }
            );

        });


    /* =====================================================
       BUTTON RIPPLE
       ===================================================== */

    document
        .querySelectorAll(".btn, button")
        .forEach(button => {

            button.addEventListener(
                "click",
                function (event) {

                    const ripple =
                        document.createElement(
                            "span"
                        );


                    ripple.className =
                        "button-ripple";


                    const rect =
                        this.getBoundingClientRect();


                    const size =
                        Math.max(
                            rect.width,
                            rect.height
                        );


                    ripple.style.width =
                        `${size}px`;


                    ripple.style.height =
                        `${size}px`;


                    ripple.style.left =
                        `${
                            event.clientX -
                            rect.left -
                            size / 2
                        }px`;


                    ripple.style.top =
                        `${
                            event.clientY -
                            rect.top -
                            size / 2
                        }px`;


                    this.appendChild(
                        ripple
                    );


                    setTimeout(
                        () => ripple.remove(),
                        700
                    );

                }
            );

        });


    /* =====================================================
       REDUCED MOTION
       ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (reducedMotion.matches) {

        document.documentElement.classList.add(
            "reduced-motion"
        );
    }


    /* =====================================================
       DESTINATION & PROGRAM EXPLORER
       ===================================================== */

    const studyCountry =
        document.getElementById(
            "studyCountry"
        );


    const studyLevel =
        document.getElementById(
            "studyLevel"
        );


    const studyField =
        document.getElementById(
            "studyField"
        );


    const explorePrograms =
        document.getElementById(
            "explorePrograms"
        );


    const explorerResult =
        document.getElementById(
            "explorerResult"
        );


    const destinationPages = {

        korea:
            "pages/korea.html",

        china:
            "pages/china.html",

        germany:
            "pages/germany.html",

        usa:
            "pages/usa.html",

        italy:
            "pages/italy.html",

        uk:
            "pages/uk.html"

    };


    const countryNames = {

        korea:
            "South Korea",

        china:
            "China",

        germany:
            "Germany",

        usa:
            "United States",

        italy:
            "Italy",

        uk:
            "United Kingdom"

    };


    if (
        explorePrograms &&
        studyCountry &&
        studyLevel &&
        studyField &&
        explorerResult
    ) {

        explorePrograms.addEventListener(
            "click",
            () => {

                const country =
                    studyCountry.value;

                const level =
                    studyLevel.value;

                const field =
                    studyField.value;


                /* =====================================
                   VALIDATION
                   ===================================== */

                if (
                    !country ||
                    !level ||
                    !field
                ) {

                    explorerResult.classList.remove(
                        "active"
                    );


                    explorerResult.innerHTML = `

                        <div class="result-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Complete your search.
                            </strong>

                            <p>
                                Please select a destination,
                                study level and field of study.
                            </p>

                        </div>

                    `;

                    explorerResult.classList.add(
                        "active"
                    );

                    return;
                }


                const countryName =
                    countryNames[country];


                const page =
                    destinationPages[country];


                explorerResult.classList.add(
                    "active"
                );


                explorerResult.innerHTML = `

                    <div class="result-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Explore ${countryName}
                        </strong>

                        <p>
                            We found a study pathway for
                            your selected preferences.
                            Continue to explore
                            ${countryName} and review
                            the available information.
                        </p>

                        <a
                            href="${page}"
                            style="
                                display:inline-block;
                                margin-top:10px;
                                color:#a27a32;
                                font-size:13px;
                                font-weight:800;
                                text-decoration:none;
                            "
                        >
                            View ${countryName} →
                        </a>

                    </div>

                `;

            }
        );

    }


    /* =====================================================
       UNIVERSITY EXPLORER
       ===================================================== */

    const universityCountry =
        document.getElementById(
            "universityCountry"
        );


    const universityLevel =
        document.getElementById(
            "universityLevel"
        );


    const universityField =
        document.getElementById(
            "universityField"
        );


    const universitySearchBtn =
        document.getElementById(
            "universitySearchBtn"
        );


    const universityCards =
        document.querySelectorAll(
            ".university-card"
        );


    const universityResultCount =
        document.getElementById(
            "universityResultCount"
        );


    const universityEmpty =
        document.getElementById(
            "universityEmpty"
        );


    const universityGrid =
        document.getElementById(
            "universityGrid"
        );


    if (
        universityCountry &&
        universityLevel &&
        universityField &&
        universitySearchBtn &&
        universityResultCount &&
        universityEmpty &&
        universityGrid
    ) {

        universitySearchBtn.addEventListener(
            "click",
            () => {

                const selectedCountry =
                    universityCountry.value;


                const selectedLevel =
                    universityLevel.value;


                const selectedField =
                    universityField.value;


                let visibleCount = 0;


                universityCards.forEach(
                    card => {

                        const cardCountry =
                            card.dataset.country ||
                            "";


                        const cardLevels =
                            (
                                card.dataset.level ||
                                ""
                            ).split(" ");


                        const cardFields =
                            (
                                card.dataset.field ||
                                ""
                            ).split(" ");


                        const countryMatch =
                            selectedCountry === "all" ||
                            cardCountry ===
                                selectedCountry;


                        const levelMatch =
                            selectedLevel === "all" ||
                            cardLevels.includes(
                                selectedLevel
                            );


                        const fieldMatch =
                            selectedField === "all" ||
                            cardFields.includes(
                                selectedField
                            );


                        if (
                            countryMatch &&
                            levelMatch &&
                            fieldMatch
                        ) {

                            card.classList.remove(
                                "is-hidden"
                            );

                            visibleCount++;

                        } else {

                            card.classList.add(
                                "is-hidden"
                            );

                        }

                    }
                );


                /* =====================================
                   RESULT
                   ===================================== */

                if (visibleCount === 0) {

                    universityEmpty.classList.add(
                        "show"
                    );


                    universityResultCount.textContent =
                        "No matching pathways";

                } else {

                    universityEmpty.classList.remove(
                        "show"
                    );


                    universityResultCount.textContent =
                        `Showing ${visibleCount} ${
                            visibleCount === 1
                                ? "destination"
                                : "destinations"
                        }`;
                }


                /* =====================================
                   SCROLL
                   ===================================== */

                universityGrid.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    /* =====================================================
       STUDENT APPLICATION SYSTEM
       ===================================================== */

    const applicationForm =
        document.getElementById(
            "studentApplicationForm"
        );


    if (applicationForm) {

        const applicationSteps =
            Array.from(
                applicationForm.querySelectorAll(
                    ".application-step"
                )
            );


        const progressSteps =
            Array.from(
                document.querySelectorAll(
                    ".application-progress-step"
                )
            );


        const progressLines =
            Array.from(
                document.querySelectorAll(
                    ".application-progress-line"
                )
            );


        const previousButton =
            document.getElementById(
                "applicationPrevious"
            );


        const nextButton =
            document.getElementById(
                "applicationNext"
            );


        const submitButton =
            document.getElementById(
                "applicationSubmit"
            );


        const pageNumber =
            document.getElementById(
                "applicationPageNumber"
            );


        const reviewContainer =
            document.getElementById(
                "applicationReview"
            );


        let currentApplicationStep = 1;


        const totalApplicationSteps =
            applicationSteps.length;


        /* =================================================
           GET CURRENT STEP
           ================================================= */

        function getCurrentStepElement() {

            return applicationSteps.find(
                step =>
                    Number(step.dataset.step) ===
                    currentApplicationStep
            );

        }


        /* =================================================
           FIELD LABEL
           ================================================= */

        function getFieldLabel(field) {

            const label =
                applicationForm.querySelector(
                    `label[for="${field.id}"]`
                );


            if (!label) {

                return (
                    field.name ||
                    field.id ||
                    "This field"
                );

            }


            return label.textContent
                .replace("*", "")
                .trim();

        }


        /* =================================================
           SHOW FIELD ERROR
           ================================================= */

        function showFieldError(
            field,
            message
        ) {

            const fieldWrapper =
                field.closest(
                    ".application-field"
                );


            if (!fieldWrapper) {
                return;
            }


            fieldWrapper.classList.add(
                "has-error"
            );


            let errorMessage =
                fieldWrapper.querySelector(
                    ".application-error-message"
                );


            if (!errorMessage) {

                errorMessage =
                    document.createElement(
                        "small"
                    );


                errorMessage.className =
                    "application-error-message";


                fieldWrapper.appendChild(
                    errorMessage
                );
            }


            errorMessage.textContent =
                message;

        }


        /* =================================================
           CLEAR FIELD ERROR
           ================================================= */

        function clearFieldError(field) {

            const fieldWrapper =
                field.closest(
                    ".application-field"
                );


            if (!fieldWrapper) {
                return;
            }


            fieldWrapper.classList.remove(
                "has-error"
            );


            const errorMessage =
                fieldWrapper.querySelector(
                    ".application-error-message"
                );


            if (errorMessage) {

                errorMessage.textContent =
                    "";

            }

        }


        /* =================================================
           VALIDATE CURRENT STEP
           ================================================= */

        function validateCurrentStep() {

            const currentStep =
                getCurrentStepElement();


            if (!currentStep) {
                return true;
            }


            let valid = true;


            const requiredFields =
                Array.from(
                    currentStep.querySelectorAll(
                        "input[required], " +
                        "select[required], " +
                        "textarea[required]"
                    )
                );


            requiredFields.forEach(
                field => {

                    clearFieldError(
                        field
                    );


                    let value = "";


                    if (
                        field.type ===
                        "checkbox"
                    ) {

                        value =
                            field.checked
                                ? "checked"
                                : "";

                    } else {

                        value =
                            String(
                                field.value || ""
                            ).trim();

                    }


                    if (!value) {

                        valid = false;


                        showFieldError(
                            field,
                            `${getFieldLabel(field)} is required.`
                        );


                        return;
                    }


                    /* =================================
                       EMAIL
                       ================================= */

                    if (
                        field.type ===
                        "email"
                    ) {

                        const emailPattern =
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                        if (
                            !emailPattern.test(
                                value
                            )
                        ) {

                            valid = false;


                            showFieldError(
                                field,
                                "Please enter a valid email address."
                            );

                        }

                    }


                    /* =================================
                       DATE OF BIRTH
                       ================================= */

                    if (
                        field.id ===
                        "dateOfBirth"
                    ) {

                        const selectedDate =
                            new Date(value);


                        const today =
                            new Date();


                        if (
                            selectedDate >
                            today
                        ) {

                            valid = false;


                            showFieldError(
                                field,
                                "Date of birth cannot be in the future."
                            );

                        }

                    }

                }
            );


            /* =================================================
               FOCUS FIRST ERROR
               ================================================= */

            if (!valid) {

                const firstError =
                    currentStep.querySelector(
                        ".has-error input, " +
                        ".has-error select, " +
                        ".has-error textarea"
                    );


                if (firstError) {

                    setTimeout(
                        () => firstError.focus(),
                        50
                    );

                }

            }


            return valid;

        }


        /* =================================================
           UPDATE PROGRESS
           ================================================= */

        function updateApplicationProgress() {

            progressSteps.forEach(
                (step, index) => {

                    const stepNumber =
                        index + 1;


                    step.classList.remove(
                        "active",
                        "completed"
                    );


                    if (
                        stepNumber <
                        currentApplicationStep
                    ) {

                        step.classList.add(
                            "completed"
                        );

                    } else if (
                        stepNumber ===
                        currentApplicationStep
                    ) {

                        step.classList.add(
                            "active"
                        );

                    }

                }
            );


            progressLines.forEach(
                (line, index) => {

                    line.classList.toggle(
                        "active",
                        index <
                            currentApplicationStep - 1
                    );

                }
            );


            if (pageNumber) {

                pageNumber.textContent =
                    `${currentApplicationStep} / ${totalApplicationSteps}`;

            }

        }


        /* =================================================
           SHOW APPLICATION STEP
           ================================================= */

        function showApplicationStep(
            stepNumber
        ) {

            currentApplicationStep =
                stepNumber;


            applicationSteps.forEach(
                step => {

                    const stepValue =
                        Number(
                            step.dataset.step
                        );


                    step.classList.toggle(
                        "active",
                        stepValue ===
                            currentApplicationStep
                    );

                }
            );


            updateApplicationProgress();


            /* =============================================
               PREVIOUS
               ============================================= */

            if (previousButton) {

                previousButton.style.visibility =
                    currentApplicationStep === 1
                        ? "hidden"
                        : "visible";

            }


            /* =============================================
               NEXT
               ============================================= */

            if (nextButton) {

                nextButton.style.display =
                    currentApplicationStep ===
                    totalApplicationSteps
                        ? "none"
                        : "inline-flex";

            }


            /* =============================================
               SUBMIT
               ============================================= */

            if (submitButton) {

                submitButton.style.display =
                    currentApplicationStep ===
                    totalApplicationSteps
                        ? "inline-flex"
                        : "none";

            }


            /* =============================================
               SCROLL
               ============================================= */

            const topPosition =
                Math.max(
                    0,
                    applicationForm.offsetTop - 100
                );


            window.scrollTo({
                top: topPosition,
                behavior: "smooth"
            });

        }


        /* =================================================
           COLLECT APPLICATION DATA
           ================================================= */

        function collectApplicationData() {

            const formData =
                new FormData(
                    applicationForm
                );


            const data = {};


            formData.forEach(
                (value, key) => {

                    if (
                        Object.prototype.hasOwnProperty.call(
                            data,
                            key
                        )
                    ) {

                        if (
                            !Array.isArray(
                                data[key]
                            )
                        ) {

                            data[key] = [
                                data[key]
                            ];

                        }


                        data[key].push(
                            value
                        );

                    } else {

                        data[key] =
                            value;

                    }

                }
            );


            return data;

        }


        /* =================================================
           FORMAT REVIEW VALUE
           ================================================= */

        function formatReviewValue(
            value
        ) {

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                return "Not provided";

            }


            if (
                Array.isArray(value)
            ) {

                return value.join(
                    ", "
                );

            }


            return value;

        }


        /* =================================================
           BUILD APPLICATION REVIEW
           ================================================= */

        function buildApplicationReview() {

            if (!reviewContainer) {
                return;
            }


            const data =
                collectApplicationData();


            const groups = [

                {
                    title:
                        "Personal Information",

                    fields: [

                        [
                            "First name",
                            "firstName"
                        ],

                        [
                            "Last name",
                            "lastName"
                        ],

                        [
                            "Email",
                            "email"
                        ],

                        [
                            "Phone",
                            "phone"
                        ],

                        [
                            "Date of birth",
                            "dateOfBirth"
                        ],

                        [
                            "Nationality",
                            "nationality"
                        ],

                        [
                            "City",
                            "city"
                        ]

                    ]
                },


                {
                    title:
                        "Education Background",

                    fields: [

                        [
                            "Education level",
                            "educationLevel"
                        ],

                        [
                            "Field of study",
                            "fieldOfStudy"
                        ],

                        [
                            "Institution",
                            "institution"
                        ],

                        [
                            "Graduation year",
                            "graduationYear"
                        ],

                        [
                            "GPA",
                            "gpa"
                        ],

                        [
                            "English level",
                            "englishLevel"
                        ]

                    ]
                },


                {
                    title:
                        "Study Preferences",

                    fields: [

                        [
                            "Preferred country",
                            "preferredCountry"
                        ],

                        [
                            "Study level",
                            "studyLevel"
                        ],

                        [
                            "Preferred field",
                            "preferredField"
                        ],

                        [
                            "Preferred intake",
                            "intake"
                        ],

                        [
                            "Preferred university",
                            "preferredUniversity"
                        ],

                        [
                            "Study goals",
                            "studyGoals"
                        ]

                    ]
                }

            ];


            reviewContainer.innerHTML =
                "";


            groups.forEach(
                group => {

                    const groupElement =
                        document.createElement(
                            "div"
                        );


                    groupElement.className =
                        "application-review-group";


                    const heading =
                        document.createElement(
                            "h3"
                        );


                    heading.textContent =
                        group.title;


                    groupElement.appendChild(
                        heading
                    );


                    group.fields.forEach(
                        ([label, key]) => {

                            const row =
                                document.createElement(
                                    "div"
                                );


                            row.className =
                                "application-review-row";


                            const labelElement =
                                document.createElement(
                                    "div"
                                );


                            labelElement.className =
                                "application-review-label";


                            labelElement.textContent =
                                label;


                            const valueElement =
                                document.createElement(
                                    "div"
                                );


                            valueElement.className =
                                "application-review-value";


                            valueElement.textContent =
                                formatReviewValue(
                                    data[key]
                                );


                            row.appendChild(
                                labelElement
                            );


                            row.appendChild(
                                valueElement
                            );


                            groupElement.appendChild(
                                row
                            );

                        }
                    );


                    reviewContainer.appendChild(
                        groupElement
                    );

                }
            );

        }


        /* =================================================
           NEXT BUTTON
           ================================================= */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    if (
                        !validateCurrentStep()
                    ) {

                        return;

                    }


                    if (
                        currentApplicationStep <
                        totalApplicationSteps
                    ) {

                        currentApplicationStep++;


                        if (
                            currentApplicationStep ===
                            totalApplicationSteps
                        ) {

                            buildApplicationReview();

                        }


                        showApplicationStep(
                            currentApplicationStep
                        );

                    }

                }
            );

        }


        /* =================================================
           PREVIOUS BUTTON
           ================================================= */

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    if (
                        currentApplicationStep >
                        1
                    ) {

                        currentApplicationStep--;


                        showApplicationStep(
                            currentApplicationStep
                        );

                    }

                }
            );

        }


        /* =================================================
           LIVE ERROR CLEARING
           ================================================= */

        applicationForm
            .querySelectorAll(
                "input, select, textarea"
            )
            .forEach(
                field => {

                    field.addEventListener(
                        "input",
                        () => {

                            clearFieldError(
                                field
                            );

                        }
                    );


                    field.addEventListener(
                        "change",
                        () => {

                            clearFieldError(
                                field
                            );

                        }
                    );

                }
            );


        /* =================================================
           APPLICATION SUBMISSION
           ================================================= */

        applicationForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                /* =========================================
                   VALIDATE FINAL STEP
                   ========================================= */

                if (
                    !validateCurrentStep()
                ) {

                    return;

                }


                /* =========================================
                   CONSENT
                   ========================================= */

                const consent =
                    document.getElementById(
                        "applicationConsent"
                    );


                if (
                    consent &&
                    !consent.checked
                ) {

                    showFieldError(
                        consent,
                        "Please confirm the application consent."
                    );


                    consent.focus();


                    return;

                }


                /* =========================================
                   COLLECT DATA
                   ========================================= */

                const applicationData =
                    collectApplicationData();


                /* =========================================
                   LOADING
                   ========================================= */

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.dataset.originalText =
                        submitButton.textContent;

                    submitButton.textContent =
                        "Submitting Application...";

                }


                try {

                    /* =====================================
                       SEND TO BACKEND
                       ===================================== */

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/applications`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        applicationData
                                    )
                            }
                        );


                    const result =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Unable to submit your application. Please try again."
                        );

                    }


                    console.log(
                        "Application submitted successfully:",
                        result
                    );


                    /* =====================================
                       HIDE FORM
                       ===================================== */

                    applicationForm
                        .querySelectorAll(
                            ".application-step, " +
                            ".application-navigation"
                        )
                        .forEach(
                            element => {

                                element.style.display =
                                    "none";

                            }
                        );


                    /* =====================================
                       SUCCESS MESSAGE
                       ===================================== */

                    const successMessage =
                        document.querySelector(
                            ".application-success"
                        );


                    if (successMessage) {

                        successMessage.classList.add(
                            "show"
                        );


                        const successText =
                            successMessage.querySelector(
                                "p"
                            );


                        if (successText) {

                            const applicationId =
                                result.application &&
                                result.application.id
                                    ? result.application.id
                                    : "Pending";


                            successText.textContent =
                                `Your application has been submitted successfully. ` +
                                `Application ID: ${applicationId}. ` +
                                `Our team will review your application and contact you with the next steps.`;

                        }

                    }


                    /* =====================================
                       SCROLL TO SUCCESS
                       ===================================== */

                    const successPosition =
                        successMessage
                            ? successMessage.getBoundingClientRect().top +
                              window.scrollY -
                              100
                            : 0;


                    window.scrollTo({
                        top:
                            Math.max(
                                0,
                                successPosition
                            ),
                        behavior: "smooth"
                    });


                } catch (error) {

                    console.error(
                        "Application submission error:",
                        error
                    );


                    const errorBox =
                        document.getElementById(
                            "applicationSubmitError"
                        );


                    if (errorBox) {

                        errorBox.textContent =
                            error.message;

                        errorBox.classList.add(
                            "show"
                        );

                    } else {

                        alert(
                            error.message
                        );

                    }


                    /* =====================================
                       RESTORE BUTTON
                       ===================================== */

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            submitButton.dataset.originalText ||
                            "Submit Application";

                    }

                }

            }
        );


        /* =================================================
           INITIALIZE APPLICATION FORM
           ================================================= */

        if (
            totalApplicationSteps > 0
        ) {

            showApplicationStep(1);

        }

    }


    /* =====================================================
       JS READY
       ===================================================== */

    document.body.classList.add(
        "js-ready"
    );

});