// Use dotenv to load environment variables from .env file into process.env for secure configuration
require("dotenv").config();

const express = require("express");

const router = express.Router();

const axios = require("axios");

const apiKey = process.env.API_KEY;

// route for the deals page
router.get("/", (req, res) => {
  const title = "Bargains";
  const ep = `http://localhost:4000/deals`;
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

// route to get and display the deals in order of most likes
router.get("/liked", (req, res) => {
  const title = "Bargains";
  const ep = `http://localhost:4000/deals/liked`;
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

// route to get and display deals in order of when they were posted - most recent first
router.get("/recent", (req, res) => {
  const title = "Bargains";
  const ep = `http://localhost:4000/deals/recent`;
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

// route to allow a logged in user to save a deal
router.post("/save", (req, res) => {
  const sessionObj = req.session;
  if (sessionObj.authen) {
    const userId = sessionObj.authen;

    // Retrieve the deal ID from the request body
    const dealId = req.body.dealId;

    const ep = `http://localhost:4000/saveDeal?userId=${userId}&dealId=${dealId}`;

    axios
      .post(ep)
      .then(() => {
        console.log(`Deal saved successfully for user ID: ${userId}`);
        res.redirect("/deals");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("An error occurred. Please try again later.");
      });
  }
});

// route to allow a user to like a deal
router.post("/like", (req, res) => {
  const sessionObj = req.session;

  if (sessionObj.authen) {
    const userId = sessionObj.authen;

    // Retrieve the deal ID from the request body
    const dealId = req.body.dealId;

    const ep = `http://localhost:4000/likeDeal?userId=${userId}&dealId=${dealId}`;

    axios
      .post(ep)
      .then(() => {
        console.log(`Deal liked successfully for user ID: ${userId}`);
        res.redirect("/deals");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("An error occurred. Please try again later.");
      });
  }
});

// route to fetch and render users saved deals
router.get("/saved", (req, res) => {
  const title = "Saved Deals";
  const sessionObj = req.session;

  // check if the user is authenticated
  if (sessionObj.authen) {
    const userId = sessionObj.authen;
    const ep = `http://localhost:4000/savedDeals?userId=${userId}`;

    // Make a request to the backend to get saved deals
    axios
      .get(ep)
      .then((response) => {
        // Render the 'deals' view with the retrieved deals data
        res.render("deals", { tdata: title, deals: response.data });
      })
      .catch((err) => {
        console.error(err);

        // if user has no saved deals
        if (err.response && err.response.status === 404) {
          res.status(404).send("No saved deals found");
        } else {
          res.status(500).send("Error retrieving saved vouchers");
        }
      });
  }
});

router.get("/add", (req, res) => {
  const title = "Submit Deal";
  const sessionObj = req.session;
  if (sessionObj.authen) {
    res.render("add_deal", { tdata: title });
  }
});

// route to allow a logged in user to add a deal
router.post("/add", (req, res) => {
  const sessionObj = req.session;
  if (sessionObj.authen) {
    let userId = sessionObj.authen;

    // Extract deal details from request body
    const {
      dealTitle,
      dealDescription,
      dealLink,
      dealImageLink,
      dealOriginalPrice,
      dealPrice,
      dealMerchant,
      dealCategory,
    } = req.body;

    // Endpoint where post the data to the backend
    const ep = `http://localhost:4000/deals/add?key=${apiKey}`;

    // Create an object that holds the data
    const deal = {
      dealTitle: dealTitle,
      dealDescription: dealDescription,
      dealLink: dealLink,
      dealImageLink: dealImageLink,
      dealOriginalPrice: dealOriginalPrice,
      dealPrice: dealPrice,
      dealMerchant: dealMerchant,
      dealCategory: dealCategory,
      user_id: userId,
    };
    axios
      .post(ep, deal)
      .then(() => {
        console.log(`Deal added successfully for user ID: ${userId}`);
        res.redirect("/deals");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("An error occurred. Please try again later.");
      });
  }
});

// route for a specific deal
router.get("/:deal_id", (req, res) => {
  const dealId = req.params.deal_id;
  const ep = `http://localhost:4000/deals/${dealId}`;

  axios
    .get(ep)
    .then((response) => {
      let data = response.data;
      const title = data[0].title;

      // Render the deal detail page with the specific deal's details
      res.render("deal_result", { tdata: title, deals: data });
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error occurred while fetching data.", details: err });
    });
});

module.exports = router;
