const express = require("express");
const judgeRouter = express.Router();

const judgeController = require("../controllers/judgeController");

function requireJudge(req, res, next) {
  if (req.session.user && req.session.user.role === "Judge") {
    return next();
  }
  res.render("404", { error: "Access denied. Please login as Judge." });
}


judgeRouter.get("/dashboard", requireJudge, (req, res) => {
  res.render("judge", { user: req.session.user });
});

module.exports = judgeRouter;