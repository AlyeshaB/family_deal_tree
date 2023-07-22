const express = require("express");
const app = express();

const connection = require("./config/db.js");

const PORT = process.env.PORT || 4000;

// Allows the server to parse JSON data sent in the body of incoming requests
app.use(express.json());

// middleware to be able to POST form data. The "extended" set to true allows parsing of complex objects
app.use(express.urlencoded({ extended: true }));

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
    res.json(data);
  });
});

app.get("/deals", (req, res) => {
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

app.get("/vouchers/by-date", (req, res) => {
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

  // Use voucherId to fetch the specific voucher's details from the database
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

app.get("/merchants/:merchantId/deals", (req, res) => {
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

        if (dealResults.length > 0) {
          res.json({ dataType: "deals", data: dealResults });
        } else {
          res.json({ dataType: "vouchers", data: voucherResults });
        }
      }
    }
  );
});

// fetch all deals from a specific category based on its slug
app.get("/categories/:categorySlug", (req, res) => {
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

app.get("/search", (req, res) => {
  const searchQuery = req.query.search;

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

        if (dealResults.length > 0) {
          res.json({ dataType: "deals", data: dealResults });
        } else {
          res.json({ dataType: "vouchers", data: voucherResults });
        }
      }
    }
  );
});

app.post("/register", (req, res) => {
  const { first_name, second_name, username, email, password } = req.body;

  const user = {
    first_name,
    second_name,
    username,
    email,
    password,
    sign_up_date: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  const sql = "INSERT INTO user SET ?";
  connection.query(sql, user, (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, error: "User registration failed" });
    } else {
      console.log("User registered successfully");
      res.json({ success: true });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  let sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  connection.query(sql, [username, password], (err, rows) => {
    if (err) throw err;
    let numRows = rows.length;
    if (numRows > 0) {
      res.json({ authen: rows[0].user_id });
    } else {
      res.json({ authen: null });
    }
  });
});

app.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "SELECT * FROM user WHERE user_id = ?";
  connection.query(sql, [userId], (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

app.post("/saveDeal", (req, res) => {
  // Retrieve the user ID and deal ID from the query parameters
  const userId = req.query.userId;
  const dealId = req.query.dealId;

  // Save the deal in the user_deal table
  const sql = "INSERT INTO user_deal (user_id, deal_id) VALUES (?, ?)";
  connection.query(sql, [userId, dealId], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ error: "Failed to save the deal" });
    } else {
      console.log(`Deal saved successfully for user ID: ${userId}`);
      res.json({ message: "Deal saved successfully" });
    }
  });
});

app.post("/saveVoucher", (req, res) => {
  // Retrieve the user ID and voucher ID from the query parameters
  const userId = req.query.userId;
  const voucherId = req.query.voucherId;

  // Save the voucher in the user_voucher table
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
      res.json(result);
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
      res.json(result);
    }
  });
});

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

const server = app.listen(PORT, () => {
  console.log(`API started on port ${server.address().port}`);
});
