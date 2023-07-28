const express = require("express");
const app = express();

const connection = require("./config/db.js");

const PORT = process.env.PORT || 4000;

const secureApiKey = process.env.API_KEY;

const bcrypt = require("bcrypt");
const saltRounds = 10;

// Allows the server to parse JSON data sent in the body of incoming requests
app.use(express.json());

// middleware to be able to POST form data. The "extended" set to true allows parsing of complex objects
app.use(express.urlencoded({ extended: true }));

// fetches all the deals and orders them by the count of upvotes in descending order
app.get("/", (req, res) => {
  const sql = `SELECT *, COUNT(deal_up_vote.deal_id) AS vote_count
    FROM deal
    LEFT JOIN deal_up_vote ON deal.deal_id = deal_up_vote.deal_id
    GROUP BY deal.deal_id
    ORDER BY vote_count DESC`;

  connection.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    // send the fetched deals as a response
    res.json(data);
  });
});

app.get("/deals", (req, res) => {
  // query to get all data deal
  const sql = `SELECT * FROM deal`;
  connection.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(data);
  });
});

app.get("/deals/liked", (req, res) => {
  // query to get all the deals ordered by the number of likes in descending order
  const sql = `SELECT *, COUNT(deal_up_vote.deal_id) AS vote_count
  FROM deal
  LEFT JOIN deal_up_vote ON deal.deal_id = deal_up_vote.deal_id
  GROUP BY deal.deal_id
  ORDER BY vote_count DESC`;

  connection.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(data);
  });
});

app.get("/deals/recent", (req, res) => {
  // query to get all deals ordered by post date in descending order
  const sql = `SELECT * FROM deal ORDER BY post_date DESC`;

  connection.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(data);
  });
});

app.get("/deals/:deal_id", (req, res) => {
  const dealId = req.params.deal_id;

  // Use dealId to fetch the specific deal's details from the database -
  // ? placeholder to protect from SQL injection attacks
  const sql = `SELECT * FROM deal WHERE deal_id = ?`;

  connection.query(sql, [dealId], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    // Check if results were returned
    if (data.length === 0) {
      return res.status(404).json({ error: "No deal found with this ID" });
    }
    res.json(data);
  });
});

app.get("/vouchers", (req, res) => {
  const sql = `SELECT *, merchant.image_uri 
    FROM voucher 
    JOIN merchant 
    ON voucher.merchant_id = merchant.merchant_id`;

  connection.query(sql, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Database query failed", details: err });
      return;
    }
    res.json(data);
  });
});

// vouchers are ordered by their expiration date in ascending order
app.get("/vouchers/by-date", (req, res) => {
  // left join is used to ensure that all vouchers are returned even if a merchant does not exist for a particular voucher
  const sql = `
  SELECT *, merchant.image_uri 
  FROM voucher
  LEFT JOIN merchant ON voucher.merchant_id = merchant.merchant_id
  ORDER BY exp_date ASC`;

  connection.query(sql, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Database query failed", details: err });
      return;
    }
    res.json(data);
  });
});

app.get("/vouchers/likes", (req, res) => {
  // most-liked vouchers are returned first
  const sql = `
  SELECT *, merchant.image_uri, COUNT(voucher_up_vote.voucher_id) AS vote_count
  FROM voucher
  LEFT JOIN merchant ON voucher.merchant_id = merchant.merchant_id
  LEFT JOIN voucher_up_vote ON voucher.voucher_id = voucher_up_vote.voucher_id
  GROUP BY voucher.voucher_id
  ORDER BY vote_count DESC`;

  connection.query(sql, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Database query failed", details: err });
      return;
    }
    res.json(data);
  });
});

app.get("/vouchers/:voucher_id", (req, res) => {
  const voucherId = req.params.voucher_id;

  // Use voucher_id URL path parameter to fetch the specific voucher's details from the database
  const sql = `SELECT *, merchant.image_uri 
  FROM voucher 
  JOIN merchant 
  ON voucher.merchant_id = merchant.merchant_id
  WHERE voucher_id = ?`;

  connection.query(sql, [voucherId], (err, data) => {
    if (err) {
      res.status(500).json({ error: "Database query failed", details: err });
      return;
    }
    // Check if results were returned
    if (data.length === 0) {
      return res.status(404).json({ error: "No voucher found with this ID" });
    }
    res.json(data);
  });
});

app.get("/merchants", (req, res) => {
  //  query to fetch all merchants ordered by their name in ascending order
  const sql = `SELECT * FROM merchant ORDER BY merchant_name ASC`;

  connection.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database query failed", details: err });
      return;
    } else {
      res.json(results);
    }
  });
});

// route handler expects a merchant ID as a path parameter and fetches all deals and vouchers associated with the given merchant ID
app.get("/merchants/:merchantId/deals", (req, res) => {
  // extract the merchant ID from the request parameters
  const merchantId = req.params.merchantId;

  const sql = `
    SELECT * 
    FROM deal 
    JOIN merchant ON deal.merchant_id = merchant.merchant_id 
    WHERE merchant.merchant_id = ?;

    SELECT * 
    FROM voucher 
    JOIN merchant ON voucher.merchant_id = merchant.merchant_id 
    WHERE merchant.merchant_id = ?;
  `;

  connection.query(
    { sql, values: [merchantId, merchantId] },
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Database query failed", details: err });
        return;
      } else {
        const dealResults = results[0];
        const voucherResults = results[1];

        // if there are any deals send them in the response, otherwise send the vouchers
        if (dealResults.length > 0) {
          res.json({ dataType: "deals", data: dealResults });
        } else {
          res.json({ dataType: "vouchers", data: voucherResults });
        }
      }
    }
  );
});

// endpoint expects a category slug as a path parameter and returns all the deals belonging to that category
app.get("/categories/:categorySlug", (req, res) => {
  // extract the category slug from the request parameters
  const categorySlug = req.params.categorySlug;
  const sql = `SELECT deal.*, category.category_name 
  FROM deal 
  JOIN deal_category ON deal.deal_id = deal_category.deal_id 
  JOIN category ON deal_category.category_id = category.category_id 
  WHERE category.slug = ?`;

  connection.query(sql, [categorySlug], (err, data) => {
    if (err) {
      res.status(500).json({ error: "Database query failed", details: err });
      return;
    }
    res.json(data);
  });
});

// endpoint performs a search in the deal and voucher tables based on the search query parameter
app.get("/search", (req, res) => {
  const searchQuery = req.query.search;

  // query to search for deals and vouchers whose title or description contains the search query
  const sql = `SELECT * FROM deal 
  WHERE deal.title LIKE ? OR deal.description LIKE ?;
  
  SELECT *, merchant.image_uri FROM voucher 
  LEFT JOIN merchant ON voucher.merchant_id = merchant.merchant_id
  WHERE voucher.title LIKE ? OR voucher.description LIKE ?;`;

  connection.query(
    sql,
    [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
    ],
    (err, data) => {
      if (err) {
        res.status(500).json({ error: "Database query failed", details: err });
        return;
      } else {
        const dealResults = data[0];
        const voucherResults = data[1];

        // if there are matching deals return them otherwise return the matching vouchers
        if (dealResults.length > 0) {
          res.json({ dataType: "deals", data: dealResults });
        } else {
          res.json({ dataType: "vouchers", data: voucherResults });
        }
      }
    }
  );
});

// endpoint expects a POST request with a body containing the new user's details
app.post("/register", (req, res) => {
  const apiKey = req.query.key;

  if (apiKey === secureApiKey) {
    // extract the user's details from the request body
    const { first_name, second_name, username, email, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error(err);
        res.json({ success: false, error: "User registration failed" });
      } else {
        // create a user object with the extracted details and the current date and time
        const user = {
          first_name,
          second_name,
          username,
          email,
          password: hash, // replace plaintext password with hashed password
          // format for sql timestamps
          sign_up_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        };

        const sql = "INSERT INTO user SET ?";
        connection.query(sql, user, (err, result) => {
          if (err) {
            console.error(err);
            res
              .status(500)
              .json({ error: "User registration failed", details: err });
          } else {
            console.log("User registered successfully");
            res.status(200).json({ success: true });
          }
        });
      }
    });
  } else {
    res.json({ message: "API key not valid" });
  }
});

// endpoint expects a POST request with a body containing the user's username and password
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // query to fetch the user with the provided username from the database
  let sql = "SELECT * FROM user WHERE username = ?";
  connection.query(sql, [username], (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      // Compare hashed password with the one in database
      bcrypt.compare(password, rows[0].password, (err, result) => {
        if (result == true) {
          res.json({ authen: rows[0].user_id });
        } else {
          res.json({ authen: null });
        }
      });
    } else {
      res.json({ authen: null });
    }
  });
});

// get a specific user based on their userId
app.get("/user/:userId", (req, res) => {
  // extract the userId from the route parameters
  const userId = req.params.userId;

  const sql = "SELECT * FROM user WHERE user_id = ?";

  connection.query(sql, [userId], (err, rows) => {
    if (err) throw err;

    // if the user is found, return the user's details
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

// route that allows a user to save a deal
app.post("/saveDeal", (req, res) => {
  // extract the user ID and deal ID from the query parameters
  const userId = req.query.userId;
  const dealId = req.query.dealId;

  // Save the deal in the user_deal table
  const sql = "INSERT INTO user_deal (user_id, deal_id) VALUES (?, ?)";
  connection.query(sql, [userId, dealId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to save the deal" });
    } else {
      console.log(`Deal saved successfully for user ID: ${userId}`);
      res.json({ message: "Deal saved successfully" });
    }
  });
});

// route that allows a logged in user to save a voucher
app.post("/saveVoucher", (req, res) => {
  // extract the user ID and voucher ID from the query parameters
  const userId = req.query.userId;
  const voucherId = req.query.voucherId;

  // save the voucher in the user_voucher table
  const sql = "INSERT INTO user_voucher (user_id, voucher_id) VALUES (?, ?)";
  connection.query(sql, [userId, voucherId], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ error: "Failed to save the voucher" });
    } else {
      console.log(`Voucher saved successfully for user ID: ${userId}`);
      res.json({ message: "Voucher saved successfully" });
    }
  });
});

app.post("/likeDeal", (req, res) => {
  // Retrieve the user ID and deal ID from the query parameters
  const userId = req.query.userId;
  const dealId = req.query.dealId;

  // Save the deal in the deal_up_vote table
  const sql = `INSERT INTO deal_up_vote (deal_id, user_id) VALUES (?, ?)`;

  connection.query(sql, [dealId, userId], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ error: "Failed to like the deal" });
    } else {
      res.json({ message: "deal liked successfully", result });
    }
  });
});

app.post("/likeVoucher", (req, res) => {
  const userId = req.query.userId;
  const voucherId = req.query.voucherId;

  const sql = `INSERT INTO voucher_up_vote (user_id, voucher_id) VALUES (?, ?)`;

  connection.query(sql, [userId, voucherId], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ error: "Failed to process voucher like" });
    } else {
      res.json({ message: "voucher liked succesfully", result });
    }
  });
});

// returns a users saved deals
app.get("/savedDeals", (req, res) => {
  const userId = req.query.userId;

  const sql = `SELECT * FROM deal
       INNER JOIN user_deal
       ON deal.deal_id = user_deal.deal_id
       WHERE user_deal.user_id = ?`;

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving saved deals" });
    } else {
      res.json(result);
    }
  });
});

// returns a users saved vouchers
app.get("/savedVouchers", (req, res) => {
  const userId = req.query.userId;

  const sql = `SELECT *, merchant.image_uri
               FROM voucher
               INNER JOIN user_voucher ON voucher.voucher_id = user_voucher.voucher_id
               INNER JOIN merchant ON voucher.merchant_id = merchant.merchant_id
               WHERE user_voucher.user_id = ?`;

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving saved vouchers");
    } else {
      // Send back the result
      res.json(result);
    }
  });
});

app.post("/deals/add", (req, res) => {
  const secureKey = req.query.key;

  if (secureKey === secureApiKey) {
    // extract the deal details from the request body
    const {
      dealTitle,
      dealDescription,
      dealLink,
      dealImageLink,
      dealOriginalPrice,
      dealPrice,
      dealMerchant,
      dealCategory,
      user_id,
    } = req.body;
    console.log(`Deal Category: ${dealCategory}`); // Log the dealCategory value
    // query the database for the merchant ID that matches the merchant name provided
    const sqlMerchantId = `SELECT merchant_id FROM merchant WHERE merchant_name = ?`;

    connection.query(sqlMerchantId, [dealMerchant], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      } else {
        if (rows.length > 0) {
          // Merchant found, retrieve the ID
          const dealMerchantId = rows[0].merchant_id;

          // create a deal object with the extracted details
          const deal = {
            title: dealTitle,
            description: dealDescription,
            deal_uri: dealLink,
            deal_image_uri: dealImageLink,
            price: dealPrice,
            original_price: dealOriginalPrice,
            user_id: user_id,
            merchant_id: dealMerchantId,
          };

          // insert the deal into the database
          const sqlInsertDeal = "INSERT INTO deal SET ?";
          connection.query(sqlInsertDeal, deal, (err, result) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ error: "Failed to insert deal into database" });
            } else {
              console.log("Deal added successfully");

              // deal_id of the deal that's just been inserted
              const deal_id = result.insertId;

              // query the database for the category_id that matches the category name provided
              const categoryId = `SELECT category_id FROM category WHERE category_name = ?`;

              connection.query(categoryId, [dealCategory], (err, rows) => {
                if (err) {
                  console.error(err);
                  return res
                    .status(500)
                    .json({ error: "Failed to find category in database" });
                } else {
                  if (rows.length > 0) {
                    // Category found, retrieve the ID
                    const categoryId = rows[0].category_id;

                    // insert the deal_id and category_id into the deal_category table
                    const sqlInsertDealCategory =
                      "INSERT INTO deal_category (deal_id, category_id) VALUES ?";
                    const dealCategoryValues = [[deal_id, categoryId]];
                    connection.query(
                      sqlInsertDealCategory,
                      [dealCategoryValues],
                      (err, result) => {
                        if (err) {
                          console.error(err);
                          return res.status(500).json({
                            error: "Failed to insert into deal_category table",
                          });
                        } else {
                          console.log("Deal_category added successfully");

                          // Query all deals from this user
                          const userDeals =
                            "SELECT * FROM deal WHERE user_id = ?";
                          connection.query(userDeals, user_id, (err, deals) => {
                            if (err) {
                              console.error(err);
                              return res
                                .status(500)
                                .json({ error: "Failed to fetch user deals" });
                            } else {
                              // Render the deals view with the user's deals
                              res.json(deals);
                            }
                          });
                        }
                      }
                    );
                  } else {
                    // If category name is not found in the database
                    res.status(400).json({ message: "Category not found" });
                  }
                }
              });
            }
          });
        } else {
          // if merchant name is not found in the database
          res.status(400).json({ message: "Merchant not found" });
        }
      }
    });
  } else {
    res.json({ message: "API key not valid" });
  }
});

app.get("/deals/posted/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT * FROM deal WHERE user_id = ?`;

  connection.query(sql, [userId], (err, deals) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    } else {
      res.json(deals);
    }
  });
});

app.post("/vouchers/add", (req, res) => {
  const secureKey = req.query.key;

  if (secureKey === secureApiKey) {
    // extract the voucher details from the request body
    const {
      voucherTitle,
      voucherCode,
      voucherDescription,
      voucherExpiryDate,
      voucherShopLink,
      merchant,
      user_id,
    } = req.body;

    // query the database for the merchant ID that matches the merchant name provided
    const sqlMerchantId = `SELECT merchant_id FROM merchant WHERE merchant_name = ?`;

    connection.query(sqlMerchantId, [merchant], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      } else {
        if (rows.length > 0) {
          // Merchant found, retrieve the ID
          const merchantId = rows[0].merchant_id;

          // create a voucher object with the extracted details
          const voucher = {
            title: voucherTitle,
            voucher_code: voucherCode,
            description: voucherDescription,
            exp_date: voucherExpiryDate,
            shop_uri: voucherShopLink,
            user_id: user_id,
            merchant_id: merchantId,
          };

          // insert the voucher into the database
          const sqlInsertVoucher = "INSERT INTO voucher SET ?";
          connection.query(sqlInsertVoucher, voucher, (err, result) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ error: "Failed to insert voucher into database" });
            } else {
              console.log("Voucher added successfully");
              res.json({
                message: "voucher added successfully",
                key: secureApiKey,
              });
            }
          });
        } else {
          // if merchant name is not found in the database
          res.status(400).json({ message: "Merchant not found" });
        }
      }
    });
  } else {
    res.json({ message: "API key not valid" });
  }
});

app.get("/vouchers/posted/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT *, merchant.image_uri 
  FROM voucher 
  JOIN merchant ON voucher.merchant_id = merchant.merchant_id
  WHERE voucher.user_id = ?`;

  connection.query(sql, [userId], (err, vouchers) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    } else {
      res.json(vouchers);
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`API started on port ${server.address().port}`);
});
