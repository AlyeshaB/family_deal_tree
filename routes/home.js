const express = require("express");

const router = express.Router();

const axios = require("axios");

// route for the homepage
router.get("/", (req, res) => {
  const title = "Family Tree Deals";

  // endpoint to be requested from the API
  const ep = `http://localhost:4000/`;

  // make a GET request to the defined endpoint
  axios
    .get(ep)
    .then((response) => {
      // extract data from the API response
      let data = response.data;

      // log the data to the console for debugging
      console.log(data);

      // render the index page with provided title and data
      res.render("index", { tdata: title, deals: data });
    })
    // error handling for the API request
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

// route that allows an existing registered user to log in
router.post("/", (req, res) => {
  const { username, password } = req.body;

  const ep = `http://localhost:4000/login`;

  axios.post(ep, { username, password }).then((response) => {
    if (response.data.authen) {
      req.session.authen = response.data.authen;
      res.redirect("/user/dashboard");
    } else {
      res.redirect("/");
    }
  });
});

module.exports = router;
