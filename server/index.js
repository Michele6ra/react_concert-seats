"use strict";
// Main server page to set up, start and keep alive the server instance

// Requiring the necessary packages
const express = require('express'); // Package to instantiate a web server
const morgan = require('morgan'); // Package to keep a log of the http requests
const { check, validationResult } = require('express-validator'); // Middleware to validate data in the request
const cors = require('cors'); // Package to enable CORS
const passport = require('passport'); // Package to manage authentication
const LocalStrategy = require('passport-local'); // Package to manage local authentication
const session = require('express-session'); // Package to manage the session

// Requiring the necessary external modules
const dao = require('./dao'); // Module for accessing the DB
const userDao = require('./dao-user'); // module for accessing the user info in the DB

const createDOMPurify = require('dompurify'); // Package to sanitize the HTML content
const { JSDOM } = require('jsdom'); // Package to create a virtual DOM
const window = new JSDOM('').window; // Creating a virtual window
const DOMPurify = createDOMPurify(window); // Creating a DOMPurify instance

const jsonwebtoken = require('jsonwebtoken'); // Package to manage JWT tokens
const jwtSecret = '0xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX'; // Secret key to sign the JWT tokens
const expireTime = 60; //seconds

// init express
const app = new express();
const port = 3001;

// Set up the middlewares
app.use(morgan('dev')); // To print the log of the http requests on the console
app.use(express.json()); // To automatically decode incoming json formatted data

// Set up the CORS policy
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); // To enable CORS

// Set up Passport
// Set up the "username and password" login strategy by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      return done(null, user);
    })
  }
));

// Serialize and de-serialize the user (user object <-> session)
passport.serializeUser((user, done) => {
  done(null, user.idUser);
});

passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    });
});

// Custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

// Set up the session 
app.use(session({
  secret: 'nfhctejdyshtnzopqs',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/*** APIs ***/

// GET /api/concerts
app.get('/api/concerts',
  async (req, res) => {
    try {
      const concerts = await dao.getAllConcerts();

      for (let i = 0; i < concerts.length; i++) {
        const theatre = await dao.getTheatreById(concerts[i].idTheatre);
        const theatreType = await dao.getTheatreTypeById(theatre.idType);
        concerts[i].nameTheatre = theatre.nameTheatre;
        concerts[i].theatreType = theatreType.theatreType;
      }

      const concertsPurified = concerts.map(
        e => Object.assign(
          {},
          e,
          { nameConcert: DOMPurify.sanitize(e.nameConcert), nameTheatre: DOMPurify.sanitize(e.nameTheatre), theatreType: DOMPurify.sanitize(e.theatreType) }));
      res.status(200).json(concertsPurified);
    }
    catch (err) {
      res.status(500).json({ error: `Database error during the retrieval of the concerts: ${err}` });
    }
  }
);

//GET /api/:idConcert/concerts
app.get('/api/:idConcert/concerts',

  [check('idConcert').notEmpty().isInt({ min: 1 })],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const concert = await dao.getConcertById(req.params.idConcert);
      const theatre = await dao.getTheatreById(concert.idTheatre);
      const theatreType = await dao.getTheatreTypeById(theatre.idType);
      const seatsOccupied = await dao.getSeatsOccupiedByIdConcert(req.params.idConcert);

      const concertDetails = {
        idConcert: req.params.idConcert,
        nameConcert: concert.nameConcert,
        freeSeats: concert.freeSeats,
        nameTheatre: theatre.nameTheatre,
        theatreType: theatreType.theatreType,
        rows: theatreType.rows,
        columns: theatreType.columns,
        seats: []
      }

      const concertDetailsPurified = Object.assign({}, concertDetails,
        {
          nameConcert: DOMPurify.sanitize(concertDetails.nameConcert),
          nameTheatre: DOMPurify.sanitize(concertDetails.nameTheatre),
          theatreType: DOMPurify.sanitize(concertDetails.theatreType),
        });

      for (const seat of seatsOccupied.seats) {
        concertDetailsPurified.seats.push(DOMPurify.sanitize(seat))
      }

      res.status(200).json(concertDetailsPurified);
    }
    catch (err) {
      res.status(500).json({ error: `Database error during the retrieval of the concert by id: ${err}` });
    }
  })

//GET /api/userReservations
app.get('/api/userReservations', isLoggedIn,

  async (req, res) => {
    try {
      const userReservations = await dao.getReservationsByIdUser(req.user.idUser);
      const userReservationsPurified = []
      for (const reservation of userReservations) {
        const concert = await dao.getConcertById(reservation.idConcert);
        const theatre = await dao.getTheatreById(concert.idTheatre)
        const reservationPurified = {
          idConcert: reservation.idConcert,
          nameConcert: DOMPurify.sanitize(concert.nameConcert),
          nameTheatre: DOMPurify.sanitize(theatre.nameTheatre),
          seats: []
        }
        for (const seat of reservation.seats) {
          const seatPurified = DOMPurify.sanitize(seat);
          reservationPurified.seats.push(seatPurified)
        }
        userReservationsPurified.push(reservationPurified)
      }
      res.json(userReservationsPurified);
    }
    catch (err) {
      res.status(500).json({ error: `Database error during the retrieval of the reservations by idUser: ${err}` });
    }
  })

//POST /api/reservation 
app.post('/api/reservations', isLoggedIn,

  [
    check('idConcert').notEmpty().isInt({ min: 1 }),
    check('seats').notEmpty().isArray()
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const newReservation = req.body
      const newReservationPurified = {
        idConcert: newReservation.idConcert,
        seats: []
      }
      for (const seat of newReservation.seats) {
        const seatPurified = DOMPurify.sanitize(seat);
        newReservationPurified.seats.push(seatPurified)
      }

      const reservations = await dao.getReservationsByIdUser(req.user.idUser)

      const reservationProve = reservations.filter((reservation) => reservation.idConcert == newReservationPurified.idConcert)
      if (reservationProve.length > 0) {
        return res.status(500).json({ error: "reservation already exist for this user and for this concert" });
      }
      const seatRegex = /^\d+[A-Z]$/

      for (const seat of newReservationPurified.seats) {
        if (!seatRegex.test(seat)) {
          return res.status(500).json({ error: `Seat ${seat} is invalid format.` });
        }
      }

      const counts = {};
      for (const seat of newReservationPurified.seats) {
        if (counts[seat]) {
          return res.status(500).json({ error: "Repeated seat detected" });
        } else {
          counts[seat] = 1;
        }
      }

      const concert = await dao.getConcertById(newReservationPurified.idConcert);
      const theatre = await dao.getTheatreById(concert.idTheatre);
      const theatreType = await dao.getTheatreTypeById(theatre.idType);
      const theatreRows = theatreType.rows;
      const theatreColumns = theatreType.columns;

      for (const seat of newReservationPurified.seats) {
        const row = seat.match(/\d+/)[0];
        const column = seat.match(/[A-Z]/i)[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        if (row > theatreRows || row <= 0) {
          throw new Error(`Invalid seat: ${seat}. Row ${row} exceeds the maximum allowed row ${theatreRows}.`);
        }
        if (column <= 0 || column > theatreColumns) {
          throw new Error(`Invalid seat: ${seat}. Column ${column} is out of the allowed range ${1} to ${theatreColumns}.`);
        }
        const seatsOccupied = await dao.getSeatsOccupiedByIdConcert(newReservationPurified.idConcert)
        if (seatsOccupied.seats.includes(seat)) {
          return res.status(409).json("Seats are already booked.");
        }

      }

      await dao.updateFreeSeats(newReservationPurified.seats.length, newReservationPurified.idConcert)

      for (const seat of newReservationPurified.seats) {
        const seatReservation = {
          idUser: req.user.idUser,
          idConcert: newReservationPurified.idConcert,
          seat: seat
        }
        await dao.createReservation(seatReservation);
      }

      res.status(200).json({ idConcert: newReservationPurified.idConcert });
    }
    catch (err) {
      res.status(500).json({ error: `Database error during the creation of the reservation: ${err}` });
    }
  })

//DELETE /api/:idConcert/reservations
app.delete('/api/:idConcert/reservations', isLoggedIn,

  [check('idConcert').isInt({ min: 1 })],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {

      const userReservations = await dao.getReservationsByIdUser(req.user.idUser);
      const reservations = userReservations.filter((reservation) => reservation.idConcert == req.params.idConcert)

      if (reservations[0].idUser != req.user.idUser) {
        return res.status(401).json({ error: "Unauthorized user" });
      }

      if (reservations[0].seats.length > 0) {
        const seat = -(reservations[0].seats.length);
        await dao.updateFreeSeats(seat, reservations[0].idConcert);
        const changes = await dao.deleteReservation(req.user.idUser, reservations[0].idConcert);
        res.json(changes);
      }
    }
    catch (err) {
      res.status(500).json({ error: `Database error during the deletion of the reservation: ${err}` });
    }
  })


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /sessions/current
// Check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else {
    res.status(401).json({ error: 'Unauthenticated user!' });
  }
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLoyal = req.user.loyal;

  const payloadToSign = { loyal: authLoyal, authId: 1234 };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });
  console.log(jwtToken);
  res.json({ token: jwtToken, authLoyal: authLoyal });
});

