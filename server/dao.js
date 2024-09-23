"use strict";

//Requiring the necessary packages
const sqlite = require('sqlite3'); // Package to connect and interact with the database

// Opening the database and connecting to it
const db = new sqlite.Database('concert_seats.db', (err) => {
    if (err) {
        throw err;
    }
});

// Get all concerts from the database
exports.getAllConcerts = () => {
    let sql = 'SELECT * FROM concerts'
    return new Promise((resolve, reject) => {
        if (!sql) {
            resolve(" concerts not found.");
        }
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                const concerts = rows.map((elem) => (
                    {
                        idConcert: elem.idConcert,
                        nameConcert: elem.nameConcert,
                        idTheatre: elem.idTheatre,
                        freeSeats: elem.freeSeats,
                    }
                ));
                resolve(concerts);
            }
        });
    });
};

// Get a concert given unique idConcert
exports.getConcertById = (idConcert) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM concerts WHERE idConcert = ?';
        db.get(sql, [idConcert], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                if (row) {
                    let concert =
                    {
                        idConcert: row.idConcert,
                        nameConcert: row.nameConcert,
                        idTheatre: row.idTheatre,
                        freeSeats: row.freeSeats,
                    }
                    resolve(concert);
                }
                else {
                    resolve(undefined);
                }
            }
        });
    });
};

// Get a theatre given unique idTheatre
exports.getTheatreById = (idTheatre) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM theatres WHERE idTheatre = ?';
        db.get(sql, [idTheatre], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                if (row) {
                    let theatre =
                    {
                        idTheatre: row.idTheatre,
                        nameTheatre: row.nameTheatre,
                        idType: row.idType,
                    }
                    resolve(theatre);
                }
                else {
                    resolve(undefined);
                }
            }
        });
    });
};

// Get configuration of a specific theatre given unique idType
exports.getTheatreTypeById = (idType) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM theatre_types WHERE idType = ?';
        db.get(sql, [idType], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                if (row) {
                    let typeOfTheatre =
                    {
                        idType: row.idType,
                        theatreType: row.theatreType,
                        rows: row.rows,
                        columns: row.columns
                    }
                    resolve(typeOfTheatre);
                }
                else {
                    resolve(undefined);
                }
            }
        });
    });
};

// Get reservations given unique idConcert
exports.getSeatsOccupiedByIdConcert = (idConcert) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM reservations WHERE idConcert = ?';
        db.all(sql, [idConcert], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                let seatsOccupied= {
                    idConcert : idConcert,
                    seats : []
                };
                               
                for(const row of rows){
                    seatsOccupied.seats.push(row.seat)
                }
                resolve(seatsOccupied);
            }
        });
    });
};

// Get reservations given unique idUser
exports.getReservationsByIdUser = (idUser) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM reservations WHERE idUser = ?';
        db.all(sql, [idUser], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const reservationsMap = {};

                rows.forEach((row) => {
                    const key = row.idConcert;

                    if (!reservationsMap[key]) {
                        reservationsMap[key] = {
                            idUser: row.idUser,
                            idConcert: row.idConcert,
                            seats: []
                        };
                    }
                    reservationsMap[key].seats.push(row.seat);
                });
                const reservations = Object.values(reservationsMap);
                resolve(reservations);
            }
        });
    });
};

// Create a reservation in the database and return the automatically unique generated id
exports.createReservation = (reservation) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO reservations( idUser, idConcert, seat) VALUES( ?, ?, ?)';
        db.run(sql, [ reservation.idUser, reservation.idConcert, reservation.seat], function (err) {
            if (err) {
                reject(err);
            }
            else {
                
                resolve(this.lastID); //mi creo di default l'id della nuova reservation nella table reservations
            }
        });
    });
};

//delete a reservation in the table reservation by its unique identifier (idUser, idConcert)
exports.deleteReservation = (idUser, idConcert) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM reservations WHERE idUser = ? AND idConcert = ?';
        db.run(sql, [idUser, idConcert], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

//update of the freeSeats in table concerts given the idConcert
exports.updateFreeSeats = (seats, idConcert) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE concerts set freeSeats = freeSeats - ? WHERE idConcert = ?';
        db.run(sql, [seats, idConcert], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.changes);
            }
        });
    });
};