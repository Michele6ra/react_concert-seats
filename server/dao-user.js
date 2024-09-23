'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
const db = new sqlite.Database('concert_seats.db', (err) => {
  if (err) throw err;
});

exports.getUserById = (idUser) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE idUser = ?';
    db.get(sql, [idUser], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        // by default, the local strategy looks for "username":
        const user = { idUser: row.idUser, email: row.email, name: row.name, loyal: row.loyal }
        resolve(user);
      }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = { idUser: row.idUser, email: row.email, name: row.name, loyal: row.loyal };
        const salt = row.salt;
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);
          const passwordHex = Buffer.from(row.hPassword, 'hex');
          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

