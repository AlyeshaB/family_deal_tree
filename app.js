// Use dotenv to load environment variables from .env file into process.env for secure, flexible configuration
//require("dotenv").config();
const express = require("express");
const app = express();
// Define the PORT variable, use the value from the .env file if it's defined, otherwise use 3000
const PORT = process.env.PORT || 3000;
const path = require("path");

app.set("view engine", "ejs");
// Set the directory from which static files (CSS and JavaScript) will be served
app.use(express.static(path.join(__dirname, "./public")));

// Allows the server to parse JSON data sent in the body of incoming requests
app.use(express.json());
//allows the server to parse data sent in the 'application/x-www-form-urlencoded' format,
// which is commonly used by HTML forms. The "extended" set to true allows parsing of complex objects
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const title = "Family Tree Deals";
  res.render("index", { tdata: title });
});

app.get("/deals", (req, res) => {
  const title = "Bargains";
  res.render("deals", { tdata: title });
});

app.get("/vouchers", (req, res) => {
  const title = "Vouchers";
  res.render("vouchers", { tdata: title });
});

app.get("/merchants", (req, res) => {
  const title = "Merchants";
  res.render("deals", { tdata: title });
});

app.get("/categories", (req, res) => {
  const title = "Categories";
  res.render("categories", { tdata: title });
});

app.get("/register", (req, res) => {
  const title = "Sign Up";
  res.render("register", { tdata: title });
});

app.post("/register", (req, res) => {
  console.log(req.body);
  res.send("Registered!");
});

// Start the server, listening on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
