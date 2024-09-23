'use strict';
// Main server page to set up, start and keep alive the server instance

// Requiring the necessary packages
const express = require('express'); // Package to instantiate a web server
const morgan = require('morgan'); // Package to keep a log of the http requests
const cors = require('cors'); // Package to enable CORS
const { check, validationResult } = require('express-validator'); // Middleware to validate data in the request

const { expressjwt: jwt } = require('express-jwt'); // Package to manage JWT tokens

const jwtSecret = '0xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX'; // Secret key to sign the JWT tokens

// THIS IS FOR DEBUGGING ONLY: when you start the server, generate a valid token to do tests, and print it to the console
//This is used to create the token
//const jsonwebtoken = require('jsonwebtoken');
//const expireTime = 60; //seconds
//const token = jsonwebtoken.sign( { loyal: 0, authId: 1234 }, jwtSecret, {expiresIn: expireTime});
//console.log(token);

// Instantiating the server instance and the port on which it is listening
const app = express();
const PORT = 3002;

// Set up the middlewares
app.use(morgan('dev')); // To print the log of the http requests on the console
app.use(express.json()); // To automatically decode incoming json formatted data

// Set up the CORS policy
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);

// Activate the server instance
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  console.log("DEBUG: error handling function executed");
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{ 'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});


/*** APIs ***/

// POST /api/discount
app.post('/api/discount',
  [
    check('listSeats').isArray()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    try {
      const authLoyal = req.auth.loyal;
      const listSeats = req.body.listSeats;

      let sum = listSeats.reduce((acc, seat) => {
        let rowNumber = parseInt(seat.match(/\d+/)[0], 10);
        return acc + rowNumber;
      }, 0);
      let discount = sum;
      if (!authLoyal) {
        discount = sum / 3;
      }
      let randomValue = Math.random() * (15) + 5;
      discount += randomValue;
      discount = Math.round(discount);
      discount = Math.max(5, Math.min(discount, 50));
      res.json({ discount: discount });
    } catch (err) {
      res.status(500).json({ error: `Database error during the retrieval of the discount: ${err}` });
    }
  });

