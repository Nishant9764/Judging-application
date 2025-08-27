// adminDashboard.js

async function fetchDashboardData() {
  try {
    const res = await fetch("/admin/dashboard-data", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "Dashboard fetch failed. Status:",
        res.status,
        "Body:",
        text
      );
      return;
    }

    const data = await res.json();
    updateDashboard(data);
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

function updateDashboard(data) {
  // Update counters
  document.getElementById("totalRooms").innerText = data.totalRooms;
  document.getElementById("openRooms").innerText = data.openRooms;
  document.getElementById("closedRooms").innerText = data.closedRooms;

  document.getElementById("totalJudges").innerText = data.totalJudges;
  document.getElementById("assignedJudges").innerText = data.assignedJudges;
  document.getElementById("completedJudges").innerText = data.completedJudges;

  // Update room details
  const roomDetailsContainer = document.getElementById("roomDetailsContainer");
  roomDetailsContainer.innerHTML = ""; // clear old content

  data.rooms.forEach((room) => {
    const div = document.createElement("div");
    div.className = "room-card";
    div.innerHTML = `
      <h4>Room ${room.room_number} - ${room.event_name}</h4>
      <p>Capacity: ${room.capacity}</p>
      <p>Assigned Judges: ${room.assignedCount}</p>
      <ul>
        ${room.judges
          .map((j) => `<li>${j.name} (${j.assignment_status})</li>`)
          .join("")}
      </ul>
    `;
    roomDetailsContainer.appendChild(div);
  });

  // Update alerts
  const alertsContainer = document.getElementById("dashboardAlerts");
  alertsContainer.innerHTML = "";
  if (data.alerts.length === 0) {
    alertsContainer.innerHTML = "<p>No alerts 🎉</p>";
  } else {
    data.alerts.forEach((msg) => {
      const p = document.createElement("p");
      p.className = "alert";
      p.textContent = msg;
      alertsContainer.appendChild(p);
    });
  }
}

// Auto-refresh every 10 seconds
setInterval(fetchDashboardData, 10000);
fetchDashboardData(); // initial load
