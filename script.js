// script.js
// Rider Reservation System - Cleaned, commented, beginner-friendly (Option B)
// - Enforces 1.5 hour reservations
// - Max 2 active reservations per rider email
// - Supports building chosen on Home (via localStorage) OR a dropdown on Plan
// - Manage (delete) reservations via a modal
// - Summary page shows last-created reservation + list of active reservations
// ================= Rider Reservation System ===================
// Full JS — fixed, improved, and ready to paste in one block
// =============================================================

(function () {
    "use strict";

    /* --------------------
       Utility Functions
    -------------------- */

    function safeParse(json) {
        try { return JSON.parse(json) || []; }
        catch (e) { return []; }
    }

    function loadReservations() {
        return safeParse(localStorage.getItem("rider_reservations"));
    }

    function saveReservations(list) {
        localStorage.setItem("rider_reservations", JSON.stringify(list));
    }

    function formatDisplay(iso) {
        if (!iso) return "—";
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleString();
    }

    function genId() {
        return "ID_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
    }

    /* --------------------
       Room Directory
    -------------------- */

    const ROOM_DIRECTORY = {
        "Bierenbaum Fisher Hall": ["Fisher hall 101", "Fisher Room 202", "Fisher Study 104"],
        "Science & Tech Center": ["Sci Lab 12", "Tech Room 201", "STC Auditorium"],
        "Anne Brossman Sweigart Hall": ["SWG Room 104", "SWG Study 202", "SWG Lab 310"],
        "Fine Arts Center": ["Yvonne Theater", "Fine Arts 112", "Fine Arts 220"],
        "Lynch Adler Hall": ["LA 105", "LA 121", "LA 205"],
        "Moore Library": ["Study Room A", "Study Room B", "Conference Room"],
        "default": ["Main Hall"]
    };

    const ROOM_IMAGES = {
    "Lecture Room 101": "IMG_1032.jpeg",
    "Lecture Room 202": "IMG_1080.jpeg",
    "Studio 3": "IMG_1067.jpeg",

    "Sci Lab 12": "IMG_1092.jpeg",
    "Tech Room 201": "IMG_1089.jpeg",
    "STC Auditorium": "IMG_1074.jpeg",

    "Swe Hall 10": "IMG_1089.jpeg",
    "Swe Hall 22": "IMG_1074.jpeg",
    "Business Lab 310": "IMG_1085.jpeg",

    "Fine Arts 202": "IMG_1092.jpeg",
    "Fine Arts 112": "IMG_1074.jpeg",
    "Fine Arts 220": "IMG_1025.jpeg",

    "LA 105": "images/la105.jpg",
    "LA 121": "IMG_1085.jpeg",
    "LA 205": "IMG_1025.jpeg",

    "Study Room A": "IMG_1080.jpeg",
    "Study Room B": "IMG_1080.jpeg",
    "Conference Room": "IMG_1085.jpeg"
};
    /* --------------------
       Theme Toggle
    -------------------- */

    function applySavedTheme() {
        if (localStorage.getItem("themeIsDark") === "1") {
            document.body.classList.add("dark");
        }
    }

    function toggleTheme() {
        document.body.classList.toggle("dark");
        localStorage.setItem("themeIsDark",
            document.body.classList.contains("dark") ? "1" : "0"
        );
    }

    /* --------------------
       Map Selection (Index)
    -------------------- */

    function setupBuildingSelection() {
        document.querySelectorAll(".clickable-area").forEach(a => {
            a.addEventListener("click", () => {
                localStorage.setItem("selectedBuilding", a.dataset.building || "");
            });
        });

        document.querySelectorAll(".building-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const b = btn.dataset.building || btn.textContent.trim();
                localStorage.setItem("selectedBuilding", b);
                window.location.href = "plan.html";
            });
        });

        const themeBtn = document.querySelector("#themeToggle");
        if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    }

    /* --------------------
       Delete Reservation
    -------------------- */

    function deleteReservation(id) {
        const updated = loadReservations().filter(r => r.id !== id);
        saveReservations(updated);

        // If summary was showing this reservation, remove pointer
        const last = localStorage.getItem("lastReservationId");
        if (last === id) localStorage.removeItem("lastReservationId");

        // Notify pages
        document.dispatchEvent(new Event("riderReservationsChanged"));
    }

    /* --------------------
       Plan Page
    -------------------- */

    function initPlanPage() {
        const buildingInput = document.querySelector("#building");
        const buildingSelect = document.querySelector("#buildingSelect");
        const roomSelect = document.querySelector("#room");
        const notesEl = document.querySelector("#notes");
        const charCounter = document.querySelector("#charCounter");
        const form = document.querySelector("#planForm");

        let storedBuilding = localStorage.getItem("selectedBuilding") || "";

        /* ---- Pre-Fill Saved Name + Email ---- */
        const savedName = localStorage.getItem("savedName") || "";
        const savedEmail = localStorage.getItem("savedEmail") || "";

        if (document.querySelector("#fullname")) {
            document.querySelector("#fullname").value = savedName;
        }
        if (document.querySelector("#email")) {
            document.querySelector("#email").value = savedEmail;
        }

        /* ---- Populate rooms ---- */
        function populateRooms(buildingName) {
            const rooms = ROOM_DIRECTORY[buildingName] || ROOM_DIRECTORY["default"];
            roomSelect.innerHTML = "";
            rooms.forEach(r => {
                const opt = document.createElement("option");
                opt.value = r;
                opt.textContent = r;
                roomSelect.appendChild(opt);
            });
        }
        // Update room image whenever room select changes
if (roomSelect) {
    const img = document.querySelector("#roomImage");

    function updateRoomImage() {
        const selected = roomSelect.value;
        img.src = ROOM_IMAGES[selected] || "images/default-room.jpg";
    }

    // Update when user changes the room
    roomSelect.addEventListener("change", updateRoomImage);

    // Also update when rooms are first populated
    updateRoomImage();
}



        if (buildingSelect) {
            if (storedBuilding) buildingSelect.value = storedBuilding;

            populateRooms(buildingSelect.value);

            buildingSelect.addEventListener("change", () => {
                localStorage.setItem("selectedBuilding", buildingSelect.value);
                populateRooms(buildingSelect.value);
            });

        } else if (buildingInput) {
            buildingInput.value = storedBuilding;
            populateRooms(buildingInput.value);
        }

        /* ---- Notes Counter ---- */
        if (notesEl && charCounter) {
            charCounter.textContent = `${notesEl.value.length} / ${notesEl.maxLength}`;
            notesEl.addEventListener("input", () => {
                charCounter.textContent = `${notesEl.value.length} / ${notesEl.maxLength}`;
            });
        }

        /* ---- Manage Button ---- */
        if (document.querySelector("#manageBtn")) {
            document.querySelector("#manageBtn").addEventListener("click", () => {
                window.location.href = "current.html";
            });
        }

        /* ---- Form Submit ---- */
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const fullname = (document.querySelector("#fullname")?.value || "").trim();
            const email = (document.querySelector("#email")?.value || "").trim().toLowerCase();
            const title = (document.querySelector("#title")?.value || "").trim();
            const datetime = (document.querySelector("#datetime")?.value || "");
            const room = roomSelect?.value || "";
            const building = buildingSelect?.value || buildingInput?.value || storedBuilding;

            // Save name + email for future use
            localStorage.setItem("savedName", fullname);
            localStorage.setItem("savedEmail", email);
            // Validation
            let ok = true;

            const s = d => document.querySelector(`#${d}`);
            s("nameError").textContent = "";
            s("emailError").textContent = "";
            s("titleError").textContent = "";
            s("dateError").textContent = "";

            if (!fullname) { s("nameError").textContent = "Name is required."; ok = false; }
            if (!email || !email.endsWith("@rider.edu")) { s("emailError").textContent = "Enter a valid @rider.edu email."; ok = false; }
            if (!title) { s("titleError").textContent = "Title required."; ok = false; }
            if (!datetime) {
                s("dateError").textContent = "Choose a date/time."; ok = false;
            }

            const start = new Date(datetime);
            if (isNaN(start)) {
                s("dateError").textContent = "Invalid date/time.";
                ok = false;
            }

            if (!ok) return;

            const end = new Date(start.getTime() + 90 * 60 * 1000);

            const all = loadReservations();
            const now = new Date();

            const userActive = all.filter(r =>
                r.email.toLowerCase() === email &&
                new Date(r.end) > now
            );

            // Max 2 reservations
            if (userActive.length >= 2) {
                alert("You already have 2 active reservations.");
                window.location.href = "current.html";
                return;
            }

            // Overlap check
            const overlaps = userActive.some(r => {
                const s2 = new Date(r.start);
                const e2 = new Date(r.end);
                return start < e2 && end > s2;
            });

            if (overlaps) {
                alert("This reservation overlaps with one of your existing reservations.");
                return;
            }
            // Create reservation
            const newRes = {
                id: genId(),
                fullname,
                email,
                building,
                room,
                title,
                start: start.toISOString(),
                end: end.toISOString(),
                notes: notesEl?.value || ""
            };

            all.push(newRes);
            saveReservations(all);

            localStorage.setItem("lastReservationId", newRes.id);

            window.location.href = "summary.html";
        });
    }

    /* --------------------
       Summary Page
    -------------------- */

    function initSummaryPage() {
        const summaryDiv = document.querySelector("#summaryContent");
        const allDiv = document.querySelector("#allReservations");
        const manageBtn = document.querySelector("#manageFromSummary");

        function render(email) {
            const all = loadReservations();
            const active = all.filter(r =>
                r.email.toLowerCase() === email.toLowerCase() &&
                new Date(r.end) > new Date()
            );

            allDiv.innerHTML = "";

            if (active.length === 0) {
                allDiv.innerHTML = "<p>No active reservations.</p>";
                return;
            }

            active.forEach(r => {
                const item = document.createElement("div");
                item.className = "reservation-item";

                item.innerHTML = `
                    <div>
                        <strong>${r.title}</strong>
                        <div class="meta">${r.building} • ${r.room}</div>
                        <div class="meta">${formatDisplay(r.start)}</div>
                    </div>
                `;

                const del = document.createElement("button");   del.className = "btn-secondary";
                del.textContent = "Delete";
                del.addEventListener("click", () => {
                    if (!confirm("Delete this reservation?")) return;
                    deleteReservation(r.id);
                    item.remove();
                });

                item.appendChild(del);
                allDiv.appendChild(item);
            });
        }

        // show last created reservation
        const lastId = localStorage.getItem("lastReservationId");
        const all = loadReservations();
        const last = all.find(r => r.id === lastId);

        if (last) {
            summaryDiv.innerHTML = `
                <div class="card">
                    <h3>${last.title}</h3>
                    <p><strong>Name:</strong> ${last.fullname}</p>
                    <p><strong>Email:</strong> ${last.email}</p>
                    <p><strong>Building:</strong> ${last.building}</p>
                    <p><strong>Room:</strong> ${last.room}</p>
                    <p><strong>Start:</strong> ${formatDisplay(last.start)}</p>
                    <p><strong>End:</strong> ${formatDisplay(last.end)}</p>
                    <p><strong>Notes:</strong> ${last.notes || "—"}</p>
                    <p style="color:green;font-weight:bold;">Reservation Complete!</p>
                </div>
            `;

            render(last.email);
        }

        if (manageBtn) {
            manageBtn.addEventListener("click", () => {
                window.location.href = "current.html";
            });
        }

        // auto-refresh when deleted elsewhere
        document.addEventListener("riderReservationsChanged", () => {
            if (last) render(last.email);
        });
    }

    /* --------------------
       Page Routing
    -------------------- */

    document.addEventListener("DOMContentLoaded", () => {
        applySavedTheme();
        const themeBtn = document.querySelector("#themeToggle");
        if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

        if (location.pathname.includes("index.html") || location.pathname.endsWith("/")) {
            setupBuildingSelection();
        }

        if (location.pathname.includes("plan.html")) {
            initPlanPage();
        }

        if (location.pathname.includes("summary.html")) {
            initSummaryPage();
        }
    });

})();

