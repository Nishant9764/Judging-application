document.addEventListener("DOMContentLoaded", function () {
  // --- A: DEFINE ALL YOUR VARIABLES & ELEMENTS HERE ---
  const navLinks = document.querySelectorAll(".nav-link");
  const views = document.querySelectorAll(".view");
  const modal = document.getElementById("formModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalFormFields = document.getElementById("modalFormFields");
  const modalForm = document.getElementById("modalForm");
  const closeModalBtn = document.querySelector(".close-btn");
  const addEventBtn = document.getElementById("addEventBtn");
  const addJudgeBtn = document.getElementById("addJudgeBtn");
  const createRoomForm = document.getElementById("createRoomForm");
  const assignRoomForm = document.getElementById("assignRoomForm");
  const studentSearchInput = document.getElementById("studentSearchInput");
  const studentTableBody = document.getElementById("studentTableBody");
  const credentialsOutput = document.getElementById("credentialsOutput");

  const eventCounters = {};
  const eventPrefixes = {
    Drawing: "DR",
    Shloka: "SH",
    "Fancy Dress": "FD",
    Quiz: "QU",
  };
  let isSubmitting = false;

  // --- B: DEFINE ALL YOUR HELPER FUNCTIONS HERE ---

  /**
   * Creates and displays a notification message on the screen.
   * @param {string} message The message to display.
   * @param {string} type The type of notification ('success' or 'error').
   * @param {number} duration How long the notification stays visible in ms.
   */
  function showNotification(message, type = "success", duration = 4000) {
    if (!message) return;
    const container =
      document.getElementById("notification-container") ||
      createNotifContainer();
    const notif = document.createElement("div");
    notif.className = `notification ${type}`;
    notif.textContent = message;
    container.appendChild(notif);
    setTimeout(() => notif.classList.add("show"), 10);
    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 500);
    }, duration);
  }

  /**
   * Creates the notification container if it doesn't exist.
   * @returns {HTMLElement} The notification container element.
   */
  function createNotifContainer() {
    let container = document.createElement("div");
    container.id = "notification-container";
    container.className = "notification-container";
    document.body.appendChild(container);
    return container;
  }

  /**
   * Displays judge login credentials in a card.
   * @param {string} username The judge's username.
   * @param {string} password The judge's password.
   */
  function showCredentials(username, password) {
    if (!credentialsOutput) return;
    credentialsOutput.style.display = "block";
    credentialsOutput.innerHTML = `
      <div class="credentials-card">
        <h4>Judge Credentials</h4>
        <p><b>Username:</b> ${username}</p>
        <p><b>Password:</b> ${password}</p>
      </div>
    `;
  }

  /**
   * Opens the modal with a specific title and form fields.
   * @param {string} title The title for the modal.
   * @param {string} formFieldsHTML The HTML string for the form inputs.
   */
  function openModal(title, formFieldsHTML) {
    modalTitle.textContent = title;
    modalFormFields.innerHTML = formFieldsHTML;
    modal.style.display = "block";
  }

  /**
   * Closes the modal.
   */
  function closeModal() {
    modal.style.display = "none";
  }

  /**
   * Sends student status (selected/deselected) and unique ID to the server.
   * @param {string} name The student's name.
   * @param {number} status The new status (1 for selected, 0 for not).
   * @param {string|null} uniqueId The generated unique ID or null.
   */
  async function updateStudentStatus(name, status, uniqueId) {
    console.log(
      `Sending to server: Name=${name}, Status=${status}, ID=${uniqueId}`
    );
    try {
      const response = await fetch("/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          isSelected: status,
          uniqueId: uniqueId,
        }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const result = await response.json();
      console.log("Database updated successfully:", result);
    } catch (error) {
      console.error("Error updating student status:", error);
      showNotification("Could not save student status.", "error");
    }
  }

  /**
   * Assigns a room to a student and updates the database.
   * @param {string} name The student's name.
   * @param {string} room The room number.
   * @param {HTMLButtonElement} button The button that was clicked.
   * @param {HTMLInputElement} input The input field for the room number.
   */
  async function assignRoomToStudent(name, room, button, input) {
    button.disabled = true;
    button.textContent = "Saving...";

    try {
      const response = await fetch("/admin/assign-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          roomNumber: room,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update.");
      }

      showNotification(
        result.message || "Room assigned successfully!",
        "success"
      );
      input.readOnly = true;
      button.classList.add("assigned");
      button.textContent = "Assigned";
    } catch (error) {
      showNotification(error.message, "error");
      if (!button.classList.contains("assigned")) {
        button.textContent = "Assign";
      }
    } finally {
      button.disabled = false;
    }
  }

  // --- C: ADD ALL YOUR EVENT LISTENERS & INITIALIZATION LOGIC HERE ---

  // Initialize event ID counters from existing data on page load
  document.querySelectorAll("#studentTableBody tr").forEach((row) => {
    const eventName = row.dataset.event;
    const idCell = row.querySelector(".unique-id-cell");

    if (idCell && idCell.textContent.trim()) {
      const existingId = idCell.textContent.trim();
      const prefix =
        eventPrefixes[eventName] || eventName.substring(0, 2).toUpperCase();

      if (existingId.startsWith(prefix)) {
        const number = parseInt(existingId.substring(prefix.length), 10);
        if (
          !isNaN(number) &&
          (!eventCounters[eventName] || number > eventCounters[eventName])
        ) {
          eventCounters[eventName] = number;
        }
      }
    }
  });
  console.log("Counters initialized from existing data:", eventCounters);

  // View switching logic for main navigation
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const viewToShow = this.getAttribute("data-view");
      navLinks.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
      views.forEach((view) => {
        // Use class-based active state for consistency
        if (view.id === viewToShow) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });
    });
  });

  // Student search/filter logic
  if (studentSearchInput) {
    studentSearchInput.addEventListener("keyup", (event) => {
      const searchTerm = event.target.value.toLowerCase();
      const studentTableRows = document.querySelectorAll(
        "#studentTableBody tr"
      );
      studentTableRows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(searchTerm) ? "" : "none";
      });
    });
  }

  // Event delegation for the student table (Room Assignment and Checkboxes)
  if (studentTableBody) {
    // A. Main click handler for room assignment buttons
    studentTableBody.addEventListener("click", async (event) => {
      if (event.target.classList.contains("btn-assign")) {
        const button = event.target;
        const row = button.closest("tr");
        const input = row.querySelector(".room-input");
        const studentName = button.dataset.studentname;

        if (button.classList.contains("assigned")) {
          button.classList.remove("assigned");
          button.textContent = "Save";
          input.readOnly = false;
          input.focus();
          return;
        }

        const roomNumber = input.value.trim();
        if (!roomNumber) {
          showNotification("Please enter a room number.", "error");
          return;
        }
        await assignRoomToStudent(studentName, roomNumber, button, input);
      }
    });

    // B. Hover effect listeners to show "Edit" text on assigned buttons
    studentTableBody.addEventListener("mouseover", (event) => {
      const button = event.target;
      if (
        button.classList.contains("btn-assign") &&
        button.classList.contains("assigned")
      ) {
        button.textContent = "Edit";
      }
    });

    studentTableBody.addEventListener("mouseout", (event) => {
      const button = event.target;
      if (
        button.classList.contains("btn-assign") &&
        button.classList.contains("assigned")
      ) {
        button.textContent = "Assigned";
      }
    });

    // C. Logic for student selection checkboxes and ID generation
    const checkboxes = document.querySelectorAll(".student-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const row = this.closest("tr");
        const idCell = row.querySelector(".unique-id-cell");
        const eventName = row.dataset.event;
        const studentName = this.dataset.studentName;
        const newStatus = this.checked ? 1 : 0;

        if (this.checked) {
          if (!eventCounters[eventName]) eventCounters[eventName] = 0;
          eventCounters[eventName]++;
          const prefix =
            eventPrefixes[eventName] || eventName.substring(0, 2).toUpperCase();
          const idNumber = String(eventCounters[eventName]).padStart(2, "0");
          const uniqueId = `${prefix}${idNumber}`;
          idCell.textContent = uniqueId;
          row.dataset.uniqueId = uniqueId;
          updateStudentStatus(studentName, newStatus, uniqueId);
        } else {
          idCell.textContent = "";
          delete row.dataset.uniqueId;
          // Note: Decrementing counter on uncheck can be complex if not done in order.
          // The current implementation correctly handles re-adding but does not reuse numbers.
          updateStudentStatus(studentName, newStatus, null);
        }
      });
    });
  }

  // Handle "Create Room" form submission
  if (createRoomForm) {
    createRoomForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const roomNumber = document.getElementById("roomNumber").value.trim();
      const eventName = document.getElementById("eventName").value.trim();

      if (!roomNumber || !eventName) {
        showNotification("Please fill all fields", "error");
        isSubmitting = false;
        return;
      }

      try {
        const res = await fetch("/rooms/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomNumber, eventName }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showNotification(
            `✅ ${data.message}. You can now add judges.`,
            "success"
          );
          createRoomForm.reset();
        } else {
          showNotification(
            `❌ ${data.error || "Could not create room"}`,
            "error"
          );
        }
      } catch (err) {
        console.error(err);
        showNotification("❌ Server error. Could not create room.", "error");
      } finally {
        isSubmitting = false;
      }
    });
  }

  // Handle "Assign Judge to Room" form submission
  if (assignRoomForm) {
    assignRoomForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const judgeName = document.getElementById("judgeName").value.trim();
      const roomNumber = document.getElementById("roomNo").value.trim();
      const judgeEmail = prompt("Enter judge's email address:");

      if (!judgeName || !roomNumber || !judgeEmail) {
        showNotification(
          "Please fill all fields and provide an email.",
          "error"
        );
        return;
      }

      try {
        const res = await fetch("/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ judgeName, judgeEmail, roomNumber }),
        });
        const data = await res.json();
        credentialsOutput.style.display = "none"; // Hide previous credentials

        if (res.ok && data.success) {
          showNotification(data.message, "success");
          if (data.credentials) {
            showCredentials(
              data.credentials.username,
              data.credentials.password
            );
          }
          assignRoomForm.reset();
        } else {
          showNotification(data.error || "Could not assign judge", "error");
        }
      } catch (err) {
        console.error(err);
        showNotification("Server error while assigning judge", "error");
        credentialsOutput.style.display = "none";
      }
    });
  }

  // Modal Triggers
  if (addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const fields = `
        <input type="text" name="eventName" placeholder="Event Name" required>
        <input type="text" name="school" placeholder="Associated School">
        <input type="text" name="category" placeholder="Category">
      `;
      openModal("Add New Event", fields);
    });
  }

  if (addJudgeBtn) {
    addJudgeBtn.addEventListener("click", () => {
      const fields = `
        <input type="text" name="judgeName" placeholder="Judge Name" required>
        <input type="email" name="email" placeholder="Email Address" required>
        <input type="text" name="expertise" placeholder="Expertise (e.g., Music, Dance)">
      `;
      openModal("Add New Judge", fields);
    });
  }

  // Modal Closing Events
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (event) => {
    if (event.target == modal) closeModal();
  });

  // Generic Modal Form Submission (for Add Event/Judge)
  if (modalForm) {
    modalForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      // In a real application, you would send this data to the server.
      // For now, it just logs the data to the console.
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      showNotification("Data submitted (see console).", "success");
      closeModal();
    });
  }
});
