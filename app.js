// Use dotenv to load environment variables from .env file into process.env for secure, flexible configuration
//require("dotenv").config();
const express = require("express");
const app = express();
// Define the PORT variable, use the value from the .env file if it's defined, otherwise use 3000
const PORT = process.env.PORT || 3000;
const path = require("path");
const connection = require("./config/db.js");

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
  let sql = `SELECT deal_id, title, description, deal_uri, image_uri, post_date, price, original_price, user_id, merchant_id, location_id FROM deal`;
  connection.query(sql, (err, dealData) => {
    if (err) {
      throw err;
    }
    res.render("deals", { tdata: title, dealData });
  });
});

app.get("/vouchers", (req, res) => {
  const title = "Vouchers";
  res.render("vouchers", { tdata: title });
});

app.get("/merchants", (req, res) => {
  const title = "Merchants";
  connection.query(
    "SELECT * FROM merchant ORDER BY merchant_name ASC",
    (err, results) => {
      if (err) {
        throw err;
      } else {
        // render the page and pass the results
        res.render("merchants", { tdata: title, merchants: results });
      }
    }
  );
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
  const title = "Welcome";
  let userData = req.body;
  res.render("register", { sentback: userData, tdata: title });
});

// Start the server, listening on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
