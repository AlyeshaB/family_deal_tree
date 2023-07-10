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
  let sql = `SELECT * FROM deal`;
  connection.query(sql, (err, data) => {
    if (err) {
      throw err;
    }
    res.render("deals", { tdata: title, deals: data });
  });
});

app.get("/deals/:deal_id", (req, res) => {
  const dealId = req.params.deal_id;

  // Use dealId to fetch the specific deal's details from the database
  const sql = "SELECT * FROM deal WHERE deal_id = ?";

  connection.query(sql, [dealId], (err, data) => {
    if (err) {
      throw err;
    }

    // Check if results were returned
    if (data.length === 0) {
      return res.status(404).send("No deal found with this ID");
    }
    const title = data[0].title;
    // Render the deal detail page with the specific deal's details
    res.render("deal_result", { tdata: title, deals: data });
    console.log(data);
  });
});

app.get("/vouchers", (req, res) => {
  const title = "Vouchers";
  let sql =
    "SELECT voucher.voucher_id, voucher.title, voucher.discount, voucher.merchant_id, merchant.* FROM voucher JOIN merchant ON voucher.merchant_id = merchant.merchant_id";
  connection.query(sql, (err, data) => {
    if (err) {
      throw err;
    }
    res.render("vouchers", { tdata: title, vouchers: data });
  });
});

app.get("/merchants", (req, res) => {
  const title = "Merchants";
  let sql = "SELECT * FROM merchant ORDER BY merchant_name ASC";
  connection.query(sql, (err, results) => {
    if (err) {
      throw err;
    } else {
      // render the page and pass the results
      res.render("merchants", { tdata: title, merchants: results });
    }
  });
});

app.get("/categories", (req, res) => {
  const title = "Categories";
  res.render("categories", { tdata: title });
});

app.get("/categories/:categorySlug", (req, res) => {
  const title = "Bargains";
  const categorySlug = req.params.categorySlug;
  const sql = `SELECT deal.*, category.category_name 
  FROM deal 
  JOIN deal_category ON deal.deal_id = deal_category.deal_id 
  JOIN category ON deal_category.category_id = category.category_id 
  WHERE category.slug = ?`;

  connection.query(sql, [categorySlug], (err, data) => {
    if (err) {
      throw err;
    }
    res.render("deals", { tdata: title, deals: data });
    console.log(data);
  });
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
