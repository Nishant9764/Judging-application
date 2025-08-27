// routes/adminDashboard.js
const express = require("express");
const router = express.Router();
const db = require("../config/db_admin"); // promise pool (you already have)

// Primary JSON route (returns JSON only)
router.get("/dashboard", (req, res) => {
  res.render("adminDashboard", { adminId: req.query.id });
});

// JSON API
router.get("/dashboard-data", async (req, res) => {
  try {
    const [rooms] = await db.query("SELECT * FROM rooms");
    const [judges] = await db.query("SELECT * FROM users WHERE role='Judge'");

    const roomsData = await Promise.all(
      rooms.map(async (room) => {
        const [assigned] = await db.query(
          "SELECT name, assignment_status FROM users WHERE room_id=?",
          [room.id]
        );
        return {
          room_number: room.room_number,
          event_name: room.event_name,
          capacity: room.capacity,
          assignedCount: assigned.length,
          judges: assigned,
        };
      })
    );

    const alerts = [];
    roomsData.forEach((r) => {
      if (r.assignedCount >= r.capacity)
        alerts.push(`Room ${r.room_number} is full!`);
    });

    const assignedJudges = judges.filter((j) => j.room_id !== null).length;
    const completedJudges = judges.filter(
      (j) => j.assignment_status === "completed"
    ).length;

    res.json({
      totalRooms: rooms.length,
      openRooms: rooms.filter((r) => r.status === "open").length,
      closedRooms: rooms.filter((r) => r.status === "closed").length,
      totalJudges: judges.length,
      assignedJudges,
      completedJudges,
      rooms: roomsData,
      alerts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
module.exports = router;
