const express = require("express");

const router = express.Router();

const axios = require("axios");

// route for fetching and rendering a list of merchants
router.get("/", (req, res) => {
  const title = "Merchants";

  const ep = `http://localhost:4000/merchants`;

  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      res.render("merchants", { tdata: title, merchants: data });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: "Error occurred while fetching merchants.",
        details: err,
      });
    });
});

// route for fetching either all deals or all vouchers for a specific merchant
router.get("/:merchantId/deals", (req, res) => {
  const title = "Merchant Results";
  const merchantId = req.params.merchantId;

  const ep = `http://localhost:4000/merchants/${merchantId}/deals`;

  axios
    .get(ep)
    .then((response) => {
      // depending on the dataType received, render the appropriate page with the received data
      const { dataType, data } = response.data;
      if (dataType === "deals") {
        res.render("deals", { tdata: title, deals: data });
      } else if (dataType === "vouchers") {
        res.render("vouchers", { tdata: title, vouchers: data });
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
