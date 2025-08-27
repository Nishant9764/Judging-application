// public/js/adminDashboard.js
document.addEventListener("DOMContentLoaded", () => {
  const totalRoomsEl = document.getElementById("totalRooms");
  const openRoomsEl = document.getElementById("openRooms");
  const closedRoomsEl = document.getElementById("closedRooms");
  const totalJudgesEl = document.getElementById("totalJudges");
  const assignedJudgesEl = document.getElementById("assignedJudges");
  const completedJudgesEl = document.getElementById("completedJudges");
  const roomDetailsContainer = document.getElementById("roomDetailsContainer");
  const dashboardAlerts = document.getElementById("dashboardAlerts");

  async function fetchDashboardData() {
    try {
      const res = await fetch("/admin/dashboard-data", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(
          "Dashboard fetch failed. Status:",
          res.status,
          "Body:",
          txt
        );
        dashboardAlerts.innerHTML = `<p class="alert">Failed to load alerts (status ${res.status})</p>`;
        return;
      }

      // defensive: check content-type
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        console.error("Expected JSON but got:", ct, txt.slice(0, 200));
        dashboardAlerts.innerHTML = `<p class="alert">Invalid response from server</p>`;
        return;
      }

      const data = await res.json();

      // debug: log alerts we received
      console.log("Dashboard data received. alerts:", data.alerts);

      // update counters
      totalRoomsEl.textContent = data.totalRooms;
      openRoomsEl.textContent = data.openRooms;
      closedRoomsEl.textContent = data.closedRooms;
      totalJudgesEl.textContent = data.totalJudges;
      assignedJudgesEl.textContent = data.assignedJudges;
      completedJudgesEl.textContent = data.completedJudges;

      // rooms
      roomDetailsContainer.innerHTML = "";
      (data.rooms || []).forEach((room) => {
        const div = document.createElement("div");
        div.className = "room-card";
        const judgesHtml = (room.judges || [])
          .map(
            (j) =>
              `<span class="badge ${
                j.assignment_status === "completed" ? "completed" : "pending"
              }" title="${j.email}">${escapeHtml(j.name)}</span>`
          )
          .join(" ");
        const progress = Math.round(
          (room.assignedCount / Math.max(1, room.capacity)) * 100
        );
        div.innerHTML = `
          <div class="room-head">
            <strong>${escapeHtml(
              room.room_number
            )}</strong> <small>${escapeHtml(room.event_name || "")}</small>
            <div>${room.status || "open"}</div>
          </div>
          <div class="progress-bar-container"><div class="progress-bar" style="width:${progress}%"></div></div>
          <div class="room-meta">Assigned: <strong>${
            room.assignedCount
          }</strong> / ${room.capacity}</div>
          <div class="room-judges">${judgesHtml || "<em>No judges</em>"}</div>
        `;
        roomDetailsContainer.appendChild(div);
      });

      // alerts (latest)
      dashboardAlerts.innerHTML = "";
      if (!data.alerts || data.alerts.length === 0) {
        dashboardAlerts.innerHTML = '<p class="muted">No alerts</p>';
      } else {
        data.alerts.forEach((msg) => {
          const p = document.createElement("p");
          p.className = "alert-item";
          p.textContent = msg;
          dashboardAlerts.appendChild(p);
        });
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      dashboardAlerts.innerHTML = `<p class="alert">Error loading dashboard</p>`;
    }
  }

  // escape util
  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }

  // initial + periodic refresh
  fetchDashboardData();
  setInterval(fetchDashboardData, 10000);
});
