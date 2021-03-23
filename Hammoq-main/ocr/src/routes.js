const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

// const connection = mysql.createPool({
//   host: "hammoq.cpoxjpsil0qj.us-east-2.rds.amazonaws.com",
//   user: "admin",
//   password: "(gunjan23#)",
//   database: "products",
// });

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Kundan2215#1999",
  database: "SHOES",
});

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get("/product/link", function (req, res) {
//   // console.log(req.body, req.params, req.query);
//   const link = req.query.link;
//   connection.getConnection(function (err, connection) {
//     // Executing the MySQL query (select all data from the 'users' table).
//     const query =
//       "SELECT * FROM SHOES WHERE LINK like '" + "%" + link + "%" + "';";
//     console.log(query);
//     connection.query(query, function (error, results, fields) {
//       // If some error occurs, we throw an error.i
//       if (error) throw error;
//       // Getting the 'response' from the database and sending it to our route. This is were the data is.
//       res.send(results);
//     });
//   });
// });

// Creating a GET route that returns data from the 'users' table.
app.get("/product/:MODEL_NAME", function (req, res) {
  var STYLE_CODE = req.params.MODEL_NAME;
  // Connecting to the database.
  connection.getConnection(function (err, connection) {
    // Executing the MySQL query (select all data from the 'users' table).
    console.log(err);
    connection.query(
      "SELECT * from NIKE WHERE STYLE_CODE = ?;",
      [STYLE_CODE],
      function (error, results, fields) {
        // If some error occurs, we throw an error.
        if (error) throw error;

        // Getting the 'response' from the database and sending it to our route. This is were the data is.
        res.send(results);
      }
    );
  });
});

// Starting our server.
app.listen(3000, () => {
  console.log("Go to http://localhost:3000/product so you can see the data.");
});
