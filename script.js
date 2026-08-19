"use strict";

/* =========================================================
   ILLUSION → INTUITION
   Main application JavaScript
   ========================================================= */


/* =========================================================
   ILLUSION DATA
   ========================================================= */

const ILLUSIONS = {
    contrast: {
        title: "Simultaneous Contrast",
        category: "COLOR",
        description:
            "The same gray object can appear lighter or darker depending on the color surrounding it.",
        instruction:
            "Look at the gray circle. Compare how it appears against the dark and light backgrounds.",
        explanation:
            "Your visual system judges colors relative to their surroundings. The gray circle is the same color on both sides, but the dark background makes it appear lighter while the light background makes it appear darker."
    },

    ebbinghaus: {
        title: "Ebbinghaus Illusion",
        category: "SIZE",
        description:
            "Two identical center circles can appear to have different sizes because of the circles surrounding them.",
        instruction:
            "Look at the two center circles. Which one appears larger?",
        explanation:
            "The center circles are actually identical in size. The surrounding circles change your perception of their relative size. Larger surrounding circles make the center appear smaller, while smaller surrounding circles make it appear larger."
    },

    "cafe-wall": {
        title: "Café Wall Illusion",
        category: "GEOMETRY",
        description:
            "Perfectly horizontal lines can appear tilted when they are placed between alternating rows of contrasting blocks.",
        instruction:
            "Look at the horizontal rows. Do the lines appear perfectly parallel?",
        explanation:
            "The horizontal lines are parallel. The alternating arrangement of the dark and light blocks creates visual offsets that make your brain interpret the lines as tilted."
    },

    afterimage: {
        title: "Afterimage",
        category: "COLOR",
        description:
            "After staring at a strong color, your visual system can temporarily produce an opposite color when you look away.",
        instruction:
            "Focus on the colored shape for about 20 seconds, then look at a plain light surface.",
        explanation:
            "Your color-sensitive photoreceptors adapt to the strong stimulus. When the stimulus disappears, the opponent color response can temporarily dominate, creating the afterimage."
    }
};


/* =========================================================
   CART
   ========================================================= */

const CART_KEY = "illusionIntuitionCart";


function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        console.error("Could not read cart:", error);
        return [];
    }
}


function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


function getCartCount() {
    return getCart().reduce(
        (total, item) => total + item.quantity,
        0
    );
}


function updateCartCount() {
    const count = getCartCount();

    document.querySelectorAll(".cart-count").forEach(element => {
        element.textContent = count;
    });
}


function addToCart(id) {

    const illusion = ILLUSIONS[id];

    if (!illusion) {
        showToast("Illusion not found.", "error");
        return;
    }

    const cart = getCart();

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id,
            title: illusion.title,
            category: illusion.category,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();

    showToast(`${illusion.title} added to your collection.`, "success");
}


function changeQuantity(id, amount) {

    const cart = getCart();

    const item = cart.find(product => product.id === id);

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    saveCart(cart);

    renderCart();
    updateCartCount();
}


function removeFromCart(id) {

    const cart = getCart().filter(item => item.id !== id);

    saveCart(cart);

    renderCart();
    updateCartCount();

    showToast("Removed from your collection.", "success");
}


/* =========================================================
   CART PAGE
   ========================================================= */

function renderCart() {

    const cartContainer = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");

    if (!cartContainer) {
        return;
    }

    const cart = getCart();

    cartContainer.innerHTML = "";

    if (cart.length === 0) {

        if (emptyCart) {
            emptyCart.classList.remove("hidden");
        }

        updateSummary([]);

        return;
    }

    if (emptyCart) {
        emptyCart.classList.add("hidden");
    }

    cart.forEach(item => {

        const element = document.createElement("article");

        element.className = "cart-item";

        element.innerHTML = `
            <div class="cart-thumb">
                👁
            </div>

            <div>
                <h3>${escapeHTML(item.title)}</h3>

                <p>
                    ${escapeHTML(item.category)}
                </p>

                <div class="quantity-control">
                    <button
                        type="button"
                        aria-label="Decrease quantity"
                        data-action="decrease"
                        data-id="${item.id}">
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        type="button"
                        aria-label="Increase quantity"
                        data-action="increase"
                        data-id="${item.id}">
                        +
                    </button>

                    <button
                        type="button"
                        class="remove-btn"
                        data-action="remove"
                        data-id="${item.id}">
                        Remove
                    </button>
                </div>
            </div>

            <strong>
                Free
            </strong>
        `;

        cartContainer.appendChild(element);
    });

    cartContainer.querySelectorAll("[data-action]").forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;
            const action = button.dataset.action;

            if (action === "increase") {
                changeQuantity(id, 1);
            }

            if (action === "decrease") {
                changeQuantity(id, -1);
            }

            if (action === "remove") {
                removeFromCart(id);
            }
        });
    });

    updateSummary(cart);
}


function updateSummary(cart) {

    const itemCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const itemElement = document.getElementById("summaryItems");
    const subtotalElement = document.getElementById("summarySubtotal");
    const totalElement = document.getElementById("summaryTotal");
    const checkoutButton = document.getElementById("checkoutBtn");

    if (itemElement) {
        itemElement.textContent = itemCount;
    }

    if (subtotalElement) {
        subtotalElement.textContent = "$0.00";
    }

    if (totalElement) {
        totalElement.textContent = "$0.00";
    }

    if (checkoutButton) {
        checkoutButton.disabled = itemCount === 0;
    }
}


/* =========================================================
   DETAIL PAGE
   ========================================================= */

function initializeDetailPage() {

    const illustration = document.getElementById(
        "detailIllustration"
    );

    if (!illustration) {
        return;
    }

    const params = new URLSearchParams(
        window.location.search
    );

    const id = params.get("id") || "contrast";

    const illusion = ILLUSIONS[id] || ILLUSIONS.contrast;

    const title = document.getElementById("detailTitle");
    const category = document.getElementById("detailCategory");
    const description = document.getElementById(
        "detailDescription"
    );
    const breadcrumb = document.getElementById(
        "breadcrumbTitle"
    );
    const explanationText = document.getElementById(
        "explanationText"
    );
    const instruction = document.getElementById(
        "experimentInstruction"
    );

    if (title) {
        title.textContent = illusion.title;
    }

    if (category) {
        category.textContent = illusion.category;
    }

    if (description) {
        description.textContent = illusion.description;
    }

    if (breadcrumb) {
        breadcrumb.textContent = illusion.title;
    }

    if (instruction) {
        instruction.textContent = illusion.instruction;
    }

    if (explanationText) {
        explanationText.textContent = illusion.explanation;
    }

    renderDetailIllustration(
        illustration,
        id
    );

    const revealButton =
        document.getElementById("revealBtn");

    const explanation =
        document.getElementById("explanation");

    if (revealButton && explanation) {

        revealButton.addEventListener(
            "click",
            () => {

                explanation.classList.toggle("hidden");

                const isHidden =
                    explanation.classList.contains("hidden");

                revealButton.textContent =
                    isHidden
                        ? "Reveal Explanation"
                        : "Hide Explanation";
            }
        );
    }
}


function renderDetailIllustration(container, id) {

    container.className = "detail-illustration";

    if (id === "contrast") {

        container.classList.add("preview-contrast");

        container.innerHTML = `
            <div class="contrast-circle"></div>
        `;

        return;
    }

    if (id === "ebbinghaus") {

        container.classList.add("preview-ebbinghaus");

        container.innerHTML = `
            <div class="ebbing-group">
                <span class="outer large"></span>
                <span class="outer large"></span>
                <span class="outer large"></span>
                <span class="outer large"></span>
                <span class="center-circle"></span>
            </div>

            <div class="ebbing-group">
                <span class="outer small"></span>
                <span class="outer small"></span>
                <span class="outer small"></span>
                <span class="outer small"></span>
                <span class="center-circle"></span>
            </div>
        `;

        return;
    }

    if (id === "cafe-wall") {

        container.classList.add("preview-cafe");

        container.innerHTML = `
            <div class="cafe-row">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="cafe-row offset">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="cafe-row">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="cafe-lines"></div>
        `;

        return;
    }

    if (id === "afterimage") {

        container.classList.add("preview-afterimage");

        container.innerHTML = `
            <div class="afterimage-shape"></div>
        `;

        return;
    }
}


/* =========================================================
   PRODUCT FILTER
   ========================================================= */

function initializeProductFilters() {

    const grid = document.getElementById(
        "illusionGrid"
    );

    if (!grid) {
        return;
    }

    const cards = [
        ...grid.querySelectorAll(".product-card")
    ];

    const buttons = [
        ...document.querySelectorAll(".filter-btn")
    ];

    const search =
        document.getElementById("illusionSearch");

    const noResults =
        document.getElementById("noResults");

    let currentFilter = "all";


    function applyFilters() {

        const searchTerm =
            (search?.value || "")
                .trim()
                .toLowerCase();

        let visibleCount = 0;

        cards.forEach(card => {

            const category =
                card.dataset.category;

            const name =
                card.dataset.name;

            const categoryMatch =
                currentFilter === "all" ||
                category === currentFilter;

            const searchMatch =
                !searchTerm ||
                name.includes(searchTerm);

            const visible =
                categoryMatch &&
                searchMatch;

            card.classList.toggle(
                "hidden",
                !visible
            );

            if (visible) {
                visibleCount++;
            }
        });

        if (noResults) {
            noResults.classList.toggle(
                "hidden",
                visibleCount !== 0
            );
        }
    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                currentFilter =
                    button.dataset.filter;

                applyFilters();
            }
        );
    });


    if (search) {
        search.addEventListener(
            "input",
            applyFilters
        );
    }

    applyFilters();
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const button =
        document.getElementById("mobileMenuBtn");

    const nav =
        document.getElementById("navLinks");

    if (!button || !nav) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            const isOpen =
                nav.classList.toggle("open");

            button.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            button.textContent =
                isOpen ? "✕" : "☰";
        }
    );


    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener(
            "click",
            () => {

                nav.classList.remove("open");

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

                button.textContent = "☰";
            }
        );
    });
}


/* =========================================================
   LOGIN
   ========================================================= */

function initializeLogin() {

    const form =
        document.getElementById("loginForm");

    if (!form) {
        return;
    }

    const password =
        document.getElementById("password");

    const toggle =
        document.getElementById("togglePassword");

    const forgot =
        document.getElementById("forgotPassword");


    if (toggle && password) {

        toggle.addEventListener(
            "click",
            () => {

                const isPassword =
                    password.type === "password";

                password.type =
                    isPassword
                        ? "text"
                        : "password";

                toggle.textContent =
                    isPassword
                        ? "Hide"
                        : "Show";
            }
        );
    }


    if (forgot) {

        forgot.addEventListener(
            "click",
            () => {

                const email =
                    document.getElementById("email");

                if (!email?.value) {

                    showToast(
                        "Enter your email address first.",
                        "error"
                    );

                    email?.focus();

                    return;
                }

                showToast(
                    "Password reset instructions would be sent to your email.",
                    "success"
                );
            }
        );
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            showToast(
                "Sign-in successful for this demo.",
                "success"
            );

            setTimeout(
                () => {
                    window.location.href =
                        "account.html";
                },
                800
            );
        }
    );
}


/* =========================================================
   ACCOUNT
   ========================================================= */

function initializeAccount() {

    const profileForm =
        document.getElementById("profileForm");

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (!profileForm.checkValidity()) {
                    profileForm.reportValidity();
                    return;
                }

                const name =
                    document.getElementById("fullName");

                const summary =
                    document.querySelector(
                        ".profile-summary strong"
                    );

                if (summary && name) {
                    summary.textContent =
                        name.value;
                }

                showToast(
                    "Your changes have been saved.",
                    "success"
                );
            }
        );
    }


    const motionToggle =
        document.getElementById("motionToggle");

    if (motionToggle) {

        motionToggle.addEventListener(
            "change",
            () => {

                document.body.classList.toggle(
                    "reduced-motion",
                    motionToggle.checked
                );

                localStorage.setItem(
                    "reducedMotion",
                    String(motionToggle.checked)
                );
            }
        );

        const saved =
            localStorage.getItem(
                "reducedMotion"
            );

        if (saved === "true") {

            motionToggle.checked = true;

            document.body.classList.add(
                "reduced-motion"
            );
        }
    }


    const reminderToggle =
        document.getElementById(
            "reminderToggle"
        );

    if (reminderToggle) {

        const saved =
            localStorage.getItem(
                "learningReminders"
            );

        if (saved !== null) {
            reminderToggle.checked =
                saved === "true";
        }

        reminderToggle.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "learningReminders",
                    String(reminderToggle.checked)
                );

                showToast(
                    reminderToggle.checked
                        ? "Learning reminders enabled."
                        : "Learning reminders disabled.",
                    "success"
                );
            }
        );
    }
}


/* =========================================================
   SUPPORT
   ========================================================= */

function initializeSupport() {

    const form =
        document.getElementById("supportForm");

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            form.reset();

            showToast(
                "Your message has been sent successfully.",
                "success"
            );
        }
    );
}


/* =========================================================
   CHECKOUT
   ========================================================= */

function initializeCheckout() {

    const checkoutButton =
        document.getElementById("checkoutBtn");

    if (!checkoutButton) {
        return;
    }

    checkoutButton.addEventListener(
        "click",
        () => {

            const cart = getCart();

            if (cart.length === 0) {
                showToast(
                    "Your collection is empty.",
                    "error"
                );

                return;
            }

            saveCart([]);

            renderCart();
            updateCartCount();

            showToast(
                "Your learning collection is ready.",
                "success"
            );
        }
    );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    let container =
        document.querySelector(
            ".toast-container"
        );

    if (!container) {

        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(
        () => {

            toast.style.opacity = "0";
            toast.style.transform =
                "translateY(10px)";

            setTimeout(
                () => toast.remove(),
                250
            );

        },
        3000
    );
}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();

        renderCart();

        initializeDetailPage();

        initializeProductFilters();

        initializeMobileMenu();

        initializeLogin();

        initializeAccount();

        initializeSupport();

        initializeCheckout();
    }
);