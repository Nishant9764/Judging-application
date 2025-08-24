const express = require("express");
const app = express();
const path = require("path");

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

app.get("/home",(req,res)=>{
    res.render("home.ejs");
    res.send("Routed to login page");
});

app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});
