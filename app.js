const express = require("express");
const app = express();

// Define the PORT variable, use the value from the .env file if it's defined, otherwise use 3000
const PORT = process.env.PORT || 3000;
const path = require("path");
const axios = require("axios");
const connection = require("./config/db.js");
const cookieParser = require("cookie-parser");

// enables the server to store session information for each client and associate it with a unique session ID
const sessions = require("express-session");

const oneHour = 1000 * 60 * 60 * 1;
// used for maintaining session state, storing user preferences, and tracking user behavior
app.use(cookieParser());

app.use(
  sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneHour },
    resave: false,
  })
);

// middleware to keep the user logged in
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.authen ? true : false;
  next();
});

//middlesware to use the EJS template engine
app.set("view engine", "ejs");

// set the directory from which static files (CSS and JavaScript) will be served
app.use(express.static(path.join(__dirname, "./public")));

// Allows the server to parse JSON data sent in the body of incoming requests
app.use(express.json());

// middleware to be able to POST <form> data. The "extended" set to true allows parsing of complex objects
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const title = "Family Tree Deals";
  let sql =
    "SELECT deal.*, COUNT(deal_up_vote.deal_id) AS vote_count FROM deal LEFT JOIN deal_up_vote ON deal.deal_id = deal_up_vote.deal_id GROUP BY deal.deal_id ORDER BY vote_count DESC";
  connection.query(sql, (err, data) => {
    if (err) {
      throw err;
    }
    res.render("index", { tdata: title, deals: data });
  });
});

app.get("/deals", (req, res) => {
  const title = "Bargains";
  let sql = `SELECT * FROM deal`;
  connection.query(sql, (err, data) => {
    if (err) {
      throw err;
    }
    res.render("deals", {
      tdata: title,
      deals: data,
    });
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
    "SELECT voucher.voucher_id, voucher.title, voucher.merchant_id, merchant.* FROM voucher JOIN merchant ON voucher.merchant_id = merchant.merchant_id";
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

app.get("/merchants/:merchantId/deals", (req, res) => {
  const title = "Merchant Results";
  const merchantId = req.params.merchantId;
  let sql =
    "SELECT * FROM deal JOIN merchant ON deal.merchant_id = merchant.merchant_id WHERE merchant.merchant_id = ?";
  connection.query(sql, [merchantId], (err, results) => {
    if (err) {
      throw err;
    } else {
      console.log(results);
      res.render("deals", { tdata: title, deals: results });
    }
  });
});

app.get("/categories", (req, res) => {
  const title = "Categories";
  res.render("categories", { tdata: title });
});

// fetch all deals from a specific category based on its slug
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

app.get("/search", (req, res) => {
  const title = "Search Results";
  const searchQuery = req.query.search;
  const sql = `SELECT * FROM deal 
WHERE title LIKE ? OR description LIKE ?`;
  connection.query(
    sql,
    [`%${searchQuery}%`, `%${searchQuery}%`],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length === 0) {
        res.send("No search results found...");
      } else {
        res.render("deals", { tdata: title, deals: data });
      }
    }
  );
});

app.get("/register", (req, res) => {
  const title = "Sign Up";
  res.render("register", { tdata: title });
});

// post route to send user sign up data to database
app.post("/register", (req, res) => {
  const title = "Sign up";
  const { firstName, secondName, username, email, password } = req.body;

  // Basic validation
  if (!firstName || !secondName || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate email format using a regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const user = {
    first_name: firstName,
    second_name: secondName,
    username,
    email,
    password,
    sign_up_date: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  const sql = "INSERT INTO user SET ?";
  connection.query(sql, user, (err, result) => {
    if (err) {
      console.error(err);
      res.render("register", { tdata: title });
    } else {
      console.log("User registered successfully");
      // Store the user's session information
      req.session.authen = true;
      req.session.user = user;
      res.render("register", { sentback: user, tdata: title });
    }
  });
});

app.post("/", (req, res) => {
  const { username, password } = req.body;

  let sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  connection.query(sql, [username, password], (err, rows) => {
    if (err) throw err;
    let numRows = rows.length;
    if (numRows > 0) {
      req.session.authen = rows[0].user_id; // Store the user ID in the session
      res.redirect("/dashboard");
    } else {
      res.redirect("/");
    }
  });
});

app.get("/dashboard", (req, res) => {
  let title = "Profile";
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;
    let userSql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(userSql, [userId], (err, rows) => {
      if (err) throw err;
      let userData = rows[0];
      let loggedIn = true;
      res.render("dashboard", { tdata: title, userdata: userData, loggedIn });
    });
  } else {
    res.send("Access denied");
  }
});

app.post("/saveDeal", (req, res) => {
  let title = "Bargains";
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // Retrieve the deal ID from the request body
    const dealId = req.body.dealId;

    // Save the deal in the user_deal table
    const sql = "INSERT INTO user_deal (user_id, deal_id) VALUES (?, ?)";
    connection.query(sql, [userId, dealId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save the deal" });
      } else {
        console.log(`Deal saved successfully for user ID: ${userId}`);
        res.redirect("/deals");
      }
    });
  }
});

app.post("/saveVoucher", (req, res) => {
  let title = "Voucher";
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // retrieve the voucher ID from the request body
    const voucherId = req.body.voucherId;

    // Save the voucher in the voucher_deal table
    const sql = "INSERT INTO user_voucher (user_id, voucher_id) VALUES (?, ?)";
    connection.query(sql, [userId, voucherId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save the voucher" });
      } else {
        console.log(`Voucher saved successfully for user ID: ${userId}`);
        res.redirect("vouchers");
      }
    });
  }
});

app.get("/savedDeals", (req, res) => {
  let title = "Saved Deals";
  // Retrieve the user's saved deals from the database
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;
    const sql =
      "SELECT deal.* FROM deal INNER JOIN user_deal ON deal.deal_id = user_deal.deal_id WHERE user_deal.user_id = ?";
    connection.query(sql, [userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving saved deals");
      } else {
        // Render the 'deals' view with the retrieved deals data
        res.render("deals", { tdata: title, deals: result });
      }
    });
  }
});

app.get("/savedVouchers", (req, res) => {
  let title = "Saved Vouchers";
  // Retrieve the user's saved vouchers from the database
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;
    const sql =
      "SELECT voucher.* FROM voucher INNER JOIN user_voucher ON voucher.voucher_id = user_voucher.voucher_id WHERE user_voucher.user_id = ?";
    connection.query(sql, [userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving saved vouchers");
      } else {
        // Render the 'vouchers' view with the retrieved deals data
        res.render("vouchers", { tdata: title, vouchers: result });
      }
    });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    setTimeout(() => {
      res.redirect("/");
    }, 2000);
  });
});

// Start the server, listening on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
