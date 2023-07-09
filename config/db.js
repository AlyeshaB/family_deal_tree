let mysql = require("mysql");
let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", //this also could be root
  database: "family_tree_deal",
  port: "3306",
});

try {
  db.connect();
  console.log("Connected to the MySQL server");
} catch (error) {
  console.error(`Error: ${error.message}`);
}

module.exports = db;
