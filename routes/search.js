const express = require("express");

const router = express.Router();

const axios = require("axios");

// route to fetch data related to what the user types in the search bar
router.get("/", (req, res) => {
  const title = "Search Results";

  // extract the search query parameter from the request URL
  const searchQuery = req.query.search;

  const ep = `http://localhost:4000/search?search=${searchQuery}`;

  axios
    .get(ep)
    .then((response) => {
      let dataType = response.data.dataType;
      let data = response.data.data;

      // check the dataType to render the appropriate view
      if (dataType === "deals") {
        res.render("deals", { tdata: title, deals: data });
      } else if (dataType === "vouchers") {
        res.render("vouchers", { tdata: title, vouchers: data });
      } else {
        res.status(404).send("No data found");
      }
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

module.exports = router;
