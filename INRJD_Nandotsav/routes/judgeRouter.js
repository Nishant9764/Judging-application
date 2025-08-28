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
  const id = req.query.id;
  res.render("judge", { user: req.session.user, id: id });
});

module.exports = judgeRouter;