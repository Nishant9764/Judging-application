const express = require("express");
const adminRouter = express.Router();
const adminController = require("../controllers/adminController");

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "Administrator") {
    return next();
  }
  res.render("404", { error: "Access denied. Please login as Admin." });
}

adminRouter.get("/dashboard", requireAdmin, (req, res) => {
  res.render("admin", { user: req.session.user });
});

module.exports = adminRouter;