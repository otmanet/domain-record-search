const express = require("express");
const app = express();
const path = require("path");
const indexRoutes = require("./routes/index.routes");

// Optionally, you can define a static files directory (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Define the directory where your HTML files (views) are located
app.set("views", path.join(__dirname, "views"));

// Middleware to parse incoming JSON requests and make the data available in req.body
app.use(express.json());

// Middleware to parse URL-encoded data from the request body, with `extended` set to `false` to use the querystring library
app.use(express.urlencoded({ extended: false }));

// Define a route to render the HTML file
app.get("/", (req, res) => {
  res.render("index"); // Assuming you have an "index.ejs" file in the "views" directory
});

// Use the index routes for any requests that start with '/api'
app.use("/api", indexRoutes);

// Define a fallback route for '/api' that returns a 404 status and a 'Not found' message
app.use("/api", (_, res) => {
  res.status(404).json({ status: "fail", message: "Not found" });
});

module.exports = app;
