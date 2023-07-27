require("dotenv").config;

const express = require("express");

const router = express.Router();

const axios = require("axios");

const apiKey = process.env.API_KEY;

// route to fetch and display the registration page
router.get("/register", (req, res) => {
  const title = "Sign Up";
  res.render("register", { tdata: title });
});

// post route to send user sign up data to database
router.post("/register", (req, res) => {
  const title = "Sign up";

  // extract user data from the request body
  const { firstName, secondName, username, email, password } = req.body;

  // basic validation
  if (!firstName || !secondName || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // validate email format using a regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // construct user object
  const user = {
    first_name: firstName,
    second_name: secondName,
    username,
    email,
    password,
  };

  const ep = `http://localhost:4000/register?key=${apiKey}`;

  // send the user data to the backend server
  axios
    .post(ep, user)
    .then((response) => {
      if (response.data.success) {
        // Store the user's session information
        req.session.authen = true;
        req.session.user = user;
        res.render("register", { sentback: user, tdata: title });
      } else {
        console.error(response.data.error);
        res.render("register", { tdata: title });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error processing registration" });
    });
});

router.get("/dashboard", (req, res) => {
  const title = "Profile";
  const sessionObj = req.session;

  if (sessionObj.authen) {
    const userId = sessionObj.authen;

    const ep = `http://localhost:4000/user/${userId}`;

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

// route to log a user out
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      // Send error status and message to client
      return res
        .status(500)
        .json({ error: "An error occurred while trying to logout." });
    }
    setTimeout(() => {
      res.redirect("/");
    }, 2000);
  });
});

module.exports = router;
