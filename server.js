const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const db = require("./db");
const adminRouter = require("./routes/adminRouter");
const judgeRouter = require("./routes/judgeRouter");
const util = require('util');
const query = util.promisify(db.query).bind(db);


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
app.post('/api/assign-room', async (req, res) => {
    try {
        const { studentName, room } = req.body;
        const sql = "UPDATE SchoolEvents SET room = ? WHERE NAME = ?";

        // ✅ Use await with your new promisified 'query' function
        // Note: We don't destructure here, as promisify returns the 'results' object directly.
        const result = await query(sql, [room, studentName]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Room assigned successfully!' });
        } else {
            res.status(404).json({ success: false, message: 'Student not found.' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.use("/admin", adminRouter);
app.use("/judge", judgeRouter);


app.get("/*splat",(req,res)=>{
    res.render("404.ejs");
});

// --- API Endpoint to Assign a Room ---
app.post('/api/assign-room', async (req, res) => {
    // 1. Get student name and room value from the request body.
    //    It's better to use a descriptive, camelCase variable like 'studentName'.
    const { studentName, room } = req.body;

    // 2. Add validation for the student's name.
    if (!studentName) {
        return res.status(400).json({ success: false, message: 'Student name is required.' });
    }

    try {
        // 3. Prepare and execute the SQL UPDATE query using the student's name.
        const sql = "UPDATE SchoolEvents SET room = ? WHERE NAME = ?";
        const [result] = await db.execute(sql, [room, studentName]);

        if (result.affectedRows > 0) {
            // 4. Send a success response. The log message is also clearer now.
            console.log(`Successfully assigned Room "${room}" to Student: ${studentName}`);
            res.json({ success: true, message: 'Room assigned successfully!' });
        } else {
            // 5. Send an error if no student with that name was found.
            res.status(404).json({ success: false, message: `Student "${studentName}" not found.` });
        }
    } catch (error) {
        // 6. Handle any potential database errors.
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Assigned.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});
