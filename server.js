const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const db = require("./db");
const adminRouter = require("./routes/adminRouter");
const judgeRouter = require("./routes/judgeRouter");

let port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("landingPage.ejs");
});

app.post("/home",(req,res)=>{
    res.render("home.ejs");
});

app.use(session({
  secret: "1$!086543!3537@#mbwhf&hd#$",
  resave: false,
  saveUninitialized: true,
}));

function generateRandomString(length = 10) {
  return Math.random().toString(36).substr(2, length); // e.g., 'a8k3jf0b'
}

// Login POST
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  db.query(
    "SELECT * FROM users WHERE name=? AND password=? AND role=?",
    [username, password, role],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        req.session.user = results[0];
        const randomId = generateRandomString();

        if (role === "Administrator")
          return res.redirect(`/admin/dashboard?id=${randomId}`);
        else
          return res.redirect(`/judge/dashboard?id=${randomId}`);
      } else {
        res.render("login", { error: "Invalid credentials or role mismatch" });
      }
    }
  );
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.use("/admin", adminRouter);
app.use("/judge", judgeRouter);


app.get("/*splat",(req,res)=>{
    res.render("404.ejs");
});


app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});
