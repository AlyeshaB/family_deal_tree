// Use dotenv to load environment variables from .env file into process.env for secure, flexible configuration
require("dotenv").config();

const express = require("express");
const app = express();

// Define the PORT variable, use the value from the .env file if it's defined, otherwise use 3000
const PORT = process.env.PORT || 3000;
const path = require("path");
const axios = require("axios");
// const connection = require("./config/db.js");

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
  let ep = `http://localhost:4000/`;

  axios.get(ep).then((response) => {
    let data = response.data;
    console.log(data);
    res.render("index", { tdata: title, deals: data });
  });
});

app.get("/deals", (req, res) => {
  const title = "Bargains";
  let ep = `http://localhost:4000/deals`;
  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("deals", { tdata: title, deals: data });
  });
});

app.get("/deals/liked", (req, res) => {
  const title = "Bargains";
  let ep = `http://localhost:4000/deals/liked`;
  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("deals", { tdata: title, deals: data });
  });
});

app.get("/deals/recent", (req, res) => {
  const title = "Bargains";
  let ep = `http://localhost:4000/deals/recent`;
  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("deals", { tdata: title, deals: data });
  });
});

app.get("/deals/:deal_id", (req, res) => {
  const dealId = req.params.deal_id;
  let ep = `http://localhost:4000/deals/${dealId}`;

  axios.get(ep).then((response) => {
    let data = response.data;
    const title = data[0].title;
    // Render the deal detail page with the specific deal's details
    res.render("deal_result", { tdata: title, deals: data });
    console.log(data);
  });
});

app.get("/vouchers", (req, res) => {
  const title = "Vouchers";
  let ep = `http://localhost:4000/vouchers`;
  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("vouchers", { tdata: title, vouchers: data });
  });
});

app.get("/vouchers/by-exp-date", (req, res) => {
  const title = "Vouchers";
  let ep = `http://localhost:4000/vouchers/by-date`;

  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("vouchers", { tdata: title, vouchers: data });
  });
});

app.get("/vouchers/most-likes", (req, res) => {
  const title = "Vouchers";
  let ep = `http://localhost:4000/vouchers/likes`;
  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("vouchers", { tdata: title, vouchers: data });
  });
});

app.get("/vouchers/:voucher_id", (req, res) => {
  const voucherId = req.params.voucher_id;
  let ep = `http://localhost:4000/vouchers/${voucherId}`;

  axios.get(ep).then((response) => {
    let data = response.data;
    const title = data[0].title;
    // Render the voucher detail page with the specific voucher's details
    res.render("voucher_result", { tdata: title, vouchers: data });
    console.log(data);
  });
});

app.get("/merchants", (req, res) => {
  const title = "Merchants";

  let ep = `http://localhost:4000/merchants`;

  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("merchants", { tdata: title, merchants: data });
  });
});

app.get("/merchants/:merchantId/deals", (req, res) => {
  const title = "Merchant Results";
  const merchantId = req.params.merchantId;

  let ep = `http://localhost:4000/merchants/${merchantId}/deals`;

  axios.get(ep).then((response) => {
    const { dataType, data } = response.data; // Get dataType and data from response
    if (dataType === "deals") {
      res.render("deals", { tdata: title, deals: data });
    } else if (dataType === "vouchers") {
      res.render("vouchers", { tdata: title, vouchers: data });
    }
  });
});

// fetch all deals from a specific category based on its slug
app.get("/categories/:categorySlug", (req, res) => {
  const title = "Bargains";
  const categorySlug = req.params.categorySlug;
  let ep = `http://localhost:4000/categories/${categorySlug}`;

  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("deals", { tdata: title, deals: data });
    console.log(data);
  });
});

app.get("/search", (req, res) => {
  const title = "Search Results";

  const searchQuery = req.query.search;

  let ep = `http://localhost:4000/search?search=${searchQuery}`;

  axios.get(ep).then((response) => {
    let data = response.data;
    res.render("deals", { tdata: title, deals: data });
  });
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
  };

  let ep = `http://localhost:4000/register`;

  axios.post(ep, user).then((response) => {
    if (response.data.success) {
      // Store the user's session information
      req.session.authen = true;
      req.session.user = user;
      res.render("register", { sentback: user, tdata: title });
    } else {
      console.error(response.data.error);
      res.render("register", { tdata: title });
    }
  });
});

app.post("/", (req, res) => {
  const { username, password } = req.body;

  let ep = `http://localhost:4000/login`;

  axios.post(ep, { username, password }).then((response) => {
    if (response.data.authen) {
      req.session.authen = response.data.authen;
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

    let ep = `http://localhost:4000/user/${userId}`;

    axios
      .get(ep)
      .then((response) => {
        let userData = response.data;
        let loggedIn = true;

        res.render("dashboard", { tdata: title, userdata: userData, loggedIn });
      })
      .catch((err) => {
        console.error(err);
        res.send("Access denied");
      });
  } else {
    res.send("Access denied");
  }
});

app.post("/saveDeal", (req, res) => {
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // Retrieve the deal ID from the request body
    const dealId = req.body.dealId;

    let ep = `http://localhost:4000/saveDeal?userId=${userId}&dealId=${dealId}`;

    axios.post(ep).then((response) => {
      if (response.data.error) {
        console.error(response.data.error);
        res.status(500).json({ error: "Failed to save the deal" });
      } else {
        console.log(`Deal saved successfully for user ID: ${userId}`);
        res.redirect("/deals");
      }
    });
  }
});

app.post("/saveVoucher", (req, res) => {
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // Retrieve the voucher ID from the request body
    const voucherId = req.body.voucherId;

    let ep = `http://localhost:4000/saveVoucher?userId=${userId}&voucherId=${voucherId}`;

    axios.post(ep).then((response) => {
      if (response.data.error) {
        console.error(response.data.error);
        res.status(500).json({ error: "Failed to save the voucher" });
      } else {
        console.log(`Voucher saved successfully for user ID: ${userId}`);
        res.redirect("/vouchers");
      }
    });
  }
});

app.post("/likeDeal", (req, res) => {
  let sessionObj = req.session;

  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // Retrieve the deal ID from the request body
    const dealId = req.body.dealId;

    let ep = `http://localhost:4000/likeDeal?userId=${userId}&dealId=${dealId}`;

    axios.post(ep).then((response) => {
      if (response.data.error) {
        console.error(response.data.error);
        res.status(500).json({ error: "Failed to like the deal" });
      } else {
        console.log(`Deal liked successfully for user ID: ${userId}`);
        res.redirect("/deals");
      }
    });
  }
});

app.post("/likeVoucher", (req, res) => {
  const sessionObj = req.session;

  if (sessionObj.authen) {
    const userId = sessionObj.authen;
    const voucherId = req.body.voucherId;

    const ep = `http://localhost:4000/likeVoucher?userId=${userId}&voucherId=${voucherId}`;

    axios.post(ep).then((response) => {
      if (response.data.error) {
        console.error(response.data.error);
        res.status(500).send("An error occurred. Please try again later.");
      } else {
        console.log(`Voucher liked successfully for user ID: ${userId}`);
        res.redirect("/vouchers");
      }
    });
  }
});

app.get("/savedDeals", (req, res) => {
  let title = "Saved Deals";
  let sessionObj = req.session;

  if (sessionObj.authen) {
    let userId = sessionObj.authen;
    let ep = `http://localhost:4000/savedDeals?userId=${userId}`;

    // Make a request to the backend to get saved deals
    axios
      .get(ep)
      .then((response) => {
        // Render the 'deals' view with the retrieved deals data
        res.render("deals", { tdata: title, deals: response.data });
      })
      .catch((error) => {
        console.error(error.message);
        res.status(500).send("Error retrieving saved deals");
      });
  }
});

app.get("/savedVouchers", (req, res) => {
  const title = "Saved Vouchers";
  const sessionObj = req.session;

  if (sessionObj.authen) {
    const userId = sessionObj.authen;

    // endpoint for requesting saved vouchers of the user
    const endpoint = `http://localhost:4000/savedVouchers?userId=${userId}`;

    // Request saved vouchers from the backend server
    axios
      .get(endpoint)
      .then((response) => {
        const vouchers = response.data;

        // Render the vouchers view with the retrieved vouchers data
        res.render("vouchers", { tdata: title, vouchers });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error retrieving saved vouchers");
      });
  }
});

app.get("/addDeal", (req, res) => {
  let title = "Submit Deal";
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;
    res.render("add_deal", { tdata: title });
  }
});

app.post("/deals/add", (req, res) => {
  let sessionObj = req.session;
  if (!sessionObj.authen) {
    res.redirect("/");
  }

  const {
    title,
    description,
    deal_uri,
    deal_image_uri,
    original_price,
    price,
    merchant_id,
    post_date,
  } = req.body;

  const insertData = {
    title,
    description,
    deal_uri,
    deal_image_uri,
    original_price,
    price,
    user_id: sessionObj.authen,
    merchant_id,
    post_date,
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const endpoint = "http://localhost:4000/deals/add";
  axios
    .post(endpoint, insertData, config)
    .then((response) => {
      const insertedid = response.data.respObj.deal_id;
      const resmessage = response.data.respObj.message;

      res.send(`${resmessage}. INSERTED DB id ${insertedid}`);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

app.get("/addVoucher", (req, res) => {
  let title = "Submit Voucher";
  let sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;
    res.render("add_voucher", { tdata: title });
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
