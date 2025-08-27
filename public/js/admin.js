document.addEventListener("DOMContentLoaded", function () {
  // --- View Switching Logic ---
  const navLinks = document.querySelectorAll(".nav-link");
  const views = document.querySelectorAll(".view");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const viewToShow = this.getAttribute("data-view");

      navLinks.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");

      views.forEach((view) => {
        if (view.id === viewToShow) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });
    });
  });

  // --- Student Search/Filter Logic ---
  const studentSearchInput = document.getElementById("studentSearchInput");
  if (studentSearchInput) {
    const studentTableRows = document.querySelectorAll(
      "#students .data-table tbody tr"
    );

    studentSearchInput.addEventListener("keyup", (event) => {
      const searchTerm = event.target.value.toLowerCase();

      studentTableRows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
          row.style.display = ""; // Show matching row
        } else {
          row.style.display = "none"; // Hide non-matching row
        }
      });
    });
  }

  // --- Room Assignment Logic ---
  const studentTableBody = document.getElementById("studentTableBody");
  if (studentTableBody) {
    studentTableBody.addEventListener("click", async (event) => {
      if (event.target.classList.contains("btn-assign")) {
        const button = event.target;
        const studentName = button.dataset.studentname;
        const roomInput = button
          .closest(".room-assignment-cell")
          .querySelector(".room-input");
        const roomValue = roomInput.value.trim();

        button.textContent = "Saving...";
        button.disabled = true;

        try {
          const response = await fetch("/api/assign-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentName: studentName,
              room: roomValue,
            }),
          });

          // ✅ IMPORTANT: Check if the HTTP response was successful
          if (!response.ok) {
            // This will handle 404 or 500 errors from the server
            throw new Error(`Server responded with status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success) {
            // ✅ UPDATED: Changed text to "Assigned" and made it permanent
            button.textContent = "Assigned";
            // The button remains disabled to show the action is complete
            // If you want it to be clickable again, you can re-enable it here.
          } else {
            alert(`Error: ${result.message}`);
            button.textContent = "Assign";
            button.disabled = false; // Re-enable on failure
          }
        } catch (error) {
          console.error("Failed to send request:", error);
          alert("Room assigned successfully!");
          button.textContent = "Assign";
          button.disabled = false; // Re-enable on failure
        }
        // Note: I removed the 'finally' block because the button's state
        // is now handled specifically in the success/error cases.
      }
    });
  }

  // --- Modal Logic ---
  const modal = document.getElementById("formModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalFormFields = document.getElementById("modalFormFields");
  const closeModalBtn = document.querySelector(".close-btn");

  function openModal(title, formFieldsHTML) {
    modalTitle.textContent = title;
    modalFormFields.innerHTML = formFieldsHTML;
    modal.style.display = "block";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  // Modal Triggers
  const addEventBtn = document.getElementById("addEventBtn");
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

  function showNotification(message, type = "success", duration = 4000) {
    if (!message) return; // prevent empty messages

    const container = document.getElementById("notification-container");
    const notif = document.createElement("div");

    notif.className = `notification ${type}`;
    notif.textContent = message;

    container.appendChild(notif);

    // Animate in
    setTimeout(() => notif.classList.add("show"), 10);

    // Remove after duration
    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 500);
    }, duration);
  }

  const createRoomForm = document.getElementById("createRoomForm");
  let isSubmitting = false; // 🔑 prevent double submit

  createRoomForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // ignore extra submits
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
      } else if (data.error) {
        showNotification(`❌ ${data.error}`, "error");
      } else {
        showNotification("❌ Could not create room", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("❌ Could not create room", "error");
    } finally {
      isSubmitting = false; // allow next submission
    }
  });

  const addJudgeBtn = document.getElementById("addJudgeBtn");
  if (addJudgeBtn) {
    addJudgeBtn.addEventListener("click", () => {
      const fields = `
                <input type="text" name="judgeName" placeholder="Judge Name" required>
                <input type="email" name="email" placeholder="Email Address">
                <input type="text" name="expertise" placeholder="Expertise (comma-separated)">
            `;
      openModal("Add New Judge", fields);
    });
  }

  // Close modal events
  closeModalBtn.addEventListener("click", closeModal);
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      closeModal();
    }
  });

  // Handle form submission
  document
    .getElementById("modalForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      closeModal();
    });
});

// Assign Room to Judge Form
const assignRoomForm = document.getElementById("assignRoomForm");
const credentialsOutput = document.getElementById("credentialsOutput");

// --- Notification container ---
let notificationContainer = document.getElementById("notification-container1");
if (!notificationContainer) {
  notificationContainer = document.createElement("div");
  notificationContainer.id = "notification-container";
  notificationContainer.className = "notification-container";
  document.body.appendChild(notificationContainer);
}

// --- Show notification ---
function showNotification(message, type = "success") {
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  notificationContainer.appendChild(notif);
  // auto-remove after 3.5s
  setTimeout(() => notif.remove(), 3500);
}

// --- Show credentials card ---
function showCredentials(username, password) {
  credentialsOutput.style.display = "block";
  credentialsOutput.innerHTML = `
    <div class="credentials-card">
      <h4>Judge Credentials</h4>
      <p><b>Username:</b> ${username}</p>
      <p><b>Password:</b> ${password}</p>
    </div>
  `;
}

assignRoomForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const judgeName = document.getElementById("judgeName").value.trim();
  const roomNumber = document.getElementById("roomNo").value.trim();
  const judgeEmail = prompt("Enter judge email:"); // optionally ask for email

  if (!judgeName || !roomNumber || !judgeEmail) {
    showNotification("Please fill all fields", "error");
    return;
  }

  try {
    const res = await fetch("/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judgeName, judgeEmail, roomNumber }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showNotification(data.message, "success");
      if (data.credentials)
        showCredentials(data.credentials.username, data.credentials.password);
      assignRoomForm.reset();
    } else if (data.error) {
      showNotification(data.error, "error");
      credentialsOutput.style.display = "none";
    } else {
      showNotification("Could not assign judge", "error");
      credentialsOutput.style.display = "none";
    }
  } catch (err) {
    console.error(err);
    showNotification("Server error while assigning judge", "error");
    credentialsOutput.style.display = "none";
  }
});
