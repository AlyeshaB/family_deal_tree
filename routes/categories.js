const express = require("express");

const router = express.Router();

const axios = require("axios");

// fetch all deals from a specific category based on its slug
router.get("/:categorySlug", (req, res) => {
  const title = "Bargains";
  const categorySlug = req.params.categorySlug;
  const ep = `http://localhost:4000/categories/${categorySlug}`;

  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      res.render("deals", { tdata: title, deals: data });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

module.exports = router;
