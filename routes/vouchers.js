// Use dotenv to load environment variables from .env file into process.env for secure configuration
require("dotenv").config();

const express = require("express");
const router = express.Router();

const axios = require("axios");

const apiKey = process.env.API_KEY;

// route to get vouchers page
router.get("/", (req, res) => {
  const title = "Vouchers";
  const ep = `http://localhost:4000/vouchers`;
  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      res.render("vouchers", { tdata: title, vouchers: data });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

// route to get vouchers by expirary date showing ones the expire soon first
router.get("/by-exp-date", (req, res) => {
  const title = "Vouchers";
  const ep = `http://localhost:4000/vouchers/by-date`;

  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      res.render("vouchers", { tdata: title, vouchers: data });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

// route to get vouchers in order of likes - starting with most liked
router.get("/most-likes", (req, res) => {
  const title = "Vouchers";
  let ep = `http://localhost:4000/vouchers/likes`;
  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      res.render("vouchers", { tdata: title, vouchers: data });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

// route to allow a logged in user to save a voucher
router.post("/save", (req, res) => {
  const sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // Retrieve the voucher ID from the request body
    const voucherId = req.body.voucherId;

    const ep = `http://localhost:4000/saveVoucher?userId=${userId}&voucherId=${voucherId}`;

    axios
      .post(ep)
      .then(() => {
        console.log(`Voucher saved successfully for user ID: ${userId}`);
        res.redirect("/vouchers");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("An error occurred. Please try again later.");
      });
  }
});

// route to fetch and render users saved vouchers
router.get("/saved", (req, res) => {
  const title = "Saved Vouchers";
  const sessionObj = req.session;

  // check if the user is authenticated
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

        // if user has no saved vouchers
        if (err.response && err.response.status === 404) {
          res.status(404).send("No saved vouchers found");
        } else {
          res.status(500).send("Error retrieving saved vouchers");
        }
      });
  }
});

// route to allow a user to like a voucher
router.post("/like", (req, res) => {
  const sessionObj = req.session;

  // check if the user is authenticated
  if (sessionObj.authen) {
    const userId = sessionObj.authen;
    const voucherId = req.body.voucherId;

    const ep = `http://localhost:4000/likeVoucher?userId=${userId}&voucherId=${voucherId}`;

    axios
      .post(ep)
      .then(() => {
        console.log(`Voucher liked successfully for user ID: ${userId}`);
        res.redirect("/vouchers");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("An error occurred. Please try again later.");
      });
  }
});

router.get("/addVoucher", (req, res) => {
  const title = "Submit Voucher";
  const sessionObj = req.session;
  if (sessionObj.authen) {
    res.render("add_voucher", { tdata: title });
  }
});

// route to allow a logged in user to add a voucher
router.post("/add", (req, res) => {
  const sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // extract the voucher details from the request body
    const {
      voucherTitle,
      voucherCode,
      voucherDescription,
      voucherExpiryDate,
      voucherShopLink,
      merchant,
    } = req.body;
    // Endpoint where we'll post our data to the backend
    const ep = `http://localhost:4000/vouchers/add?key=${apiKey}`;

    // create a voucher object with the extracted details
    const voucher = {
      voucherTitle: voucherTitle,
      voucherCode: voucherCode,
      voucherDescription: voucherDescription,
      voucherExpiryDate: voucherExpiryDate,
      voucherShopLink: voucherShopLink,
      user_id: userId,
      merchant: merchant,
    };
    axios
      .post(ep, voucher)
      .then(() => {
        console.log(`Voucher added successfully for user ID: ${userId}`);
        res.redirect("/vouchers");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("An error occurred. Please try again later.");
      });
  }
});

// route to get a specific voucher
router.get("/:voucher_id", (req, res) => {
  const voucherId = req.params.voucher_id;
  const ep = `http://localhost:4000/vouchers/${voucherId}`;

  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      const title = data[0].title;
      // Render the voucher detail page with the specific voucher's details
      res.render("voucher_result", { tdata: title, vouchers: data });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

module.exports = router;
