// Use dotenv to load environment variables from .env file into process.env for secure configuration
require("dotenv").config();

const express = require("express");
const app = express();

// Define the PORT variable, use the value from the .env file if it's defined, otherwise use 3000
const PORT = process.env.PORT || 3000;

const path = require("path");

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

// load the route modules
const homeRoutes = require("./routes/home");
const dealsRoutes = require("./routes/deals");
const vouchersRoutes = require("./routes/vouchers");
const merchantRoutes = require("./routes/merchants");
const categoryRoutes = require("./routes/categories");
const searchRoutes = require("./routes/search");
const userRoutes = require("./routes/user");

// use the route modules as middleware
app.use("/", homeRoutes);
app.use("/deals", dealsRoutes);
app.use("/vouchers", vouchersRoutes);
app.use("/merchants", merchantRoutes);
app.use("/categories", categoryRoutes);
app.use("/search", searchRoutes);
app.use("/user", userRoutes);

// Start the server, listening on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
