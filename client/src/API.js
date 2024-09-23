const URL = 'http://localhost:3001/api';
const URL2 = 'http://localhost:3002/api';

async function getAllConcerts() {
    // GET /concerts
    const response = await fetch(URL + `/concerts`);
    const concerts = await response.json();
    if (response.ok) {
        return concerts.map((concert) => (
            {
                idConcert: concert.idConcert,
                nameConcert: concert.nameConcert,
                nameTheatre: concert.nameTheatre,
                theatreType: concert.theatreType,
                freeSeats: concert.freeSeats
            }
        ));
        
    } else {
        throw concerts;
    }
}

async function getUserReservations() {
    // GET /models
    const response = await fetch(URL + `/userReservations`, { credentials: 'include', });
    const reservations = await response.json();
    if (response.ok) {      
        return reservations.map((reservation) => (
            {
                idConcert: reservation.idConcert,
                nameConcert: reservation.nameConcert,
                nameTheatre: reservation.nameTheatre,
                seats: reservation.seats,
            }
        ));
    } else {
        throw reservations;
    }
}

async function createReservation(idConcert, seats) {
    // POST /reservations
    const response = await fetch(URL + `/reservations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "idConcert": idConcert,
            "seats": seats
        })
    });
    const error = await response.json();
    if (response.ok || response.status == 409) {
        return {
            status : response.status,
            idConcert : idConcert
        };
    } else{
        throw error;
    }
}

async function deleteReservation(idConcert) {
    // DELETE /:idConcert/reservations
    const response = await fetch(URL + `/${idConcert}/reservations`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const changes = await response.json();
    if (response.ok) {
        return changes;
    } else {
        throw changes;
    }
}

async function getConcertById(idConcert) {
    // GET /:idConcert/concerts
    const response = await fetch(URL + `/${idConcert}/concerts` );
    const concertDetails = await response.json();    
    if (response.ok) {      
        return concertDetails;
    }   
    else {
        throw concertDetails;
    }
}

//API login
async function logIn(credentials) {
    // POST /sessions 
    let response = await fetch(URL + '/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logout() {
    // DELETE /sessions/current 
    await fetch(URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
}

async function getUserInfo() {
    // GET /sessions/current
    const response = await fetch(URL + '/sessions/current', {
        credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    }
    else {
        throw userInfo;
    }
}

async function getAuthToken() {
    // GET /auth-token
    const response = await fetch(URL + '/auth-token', {
        credentials: 'include'
    });
    const token = await response.json();
    if (response.ok) {
        return token;
    } else {
        throw token; 
    }
}

async function getDiscount(authToken, listSeats) {
    // GET /discount
    const response = await fetch(URL2 + `/discount`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listSeats: listSeats }),
    });
    const discount = await response.json();
    if (response.ok) {
        return discount;
    } else {
        throw discount;
    }
}

const API = { logIn, logout, getUserInfo, getAllConcerts, getUserReservations, createReservation, getConcertById, deleteReservation, getAuthToken, getDiscount};

export default API;