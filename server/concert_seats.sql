BEGIN TRANSACTION;

DROP TABLE IF EXISTS "reservations";
DROP TABLE IF EXISTS "concerts";
DROP TABLE IF EXISTS "theatres";
DROP TABLE IF EXISTS "theatre_types";
DROP TABLE IF EXISTS "users";


CREATE TABLE IF NOT EXISTS "users"(
	"idUser" INTEGER  PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"salt" TEXT NOT NULL,
	"hPassword"	TEXT NOT NULL,
	"loyal"	NUMERIC NOT NULL
);


CREATE TABLE IF NOT EXISTS "theatre_types"(
	"idType"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"theatreType" TEXT NOT NULL,
	"rows" INTEGER NOT NULL,
	"columns" INTEGER NOT NULL
);



CREATE TABLE IF NOT EXISTS "theatres"(
	"idTheatre"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"nameTheatre" TEXT NOT NULL,
	"idType" INTEGER NOT NULL,
	FOREIGN KEY (idType) REFERENCES theatre_types(idType)
);


CREATE TABLE IF NOT EXISTS "concerts"(
	"idConcert"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"nameConcert" TEXT NOT NULL,
	"idTheatre"	INTEGER NOT NULL,
	"freeSeats" INTEGER NOT NULL,
	FOREIGN KEY (idTheatre) REFERENCES theatres(idTheatre)
);


CREATE TABLE IF NOT EXISTS "reservations"(
	"idReservation"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"idUser" INTEGER NOT NULL,
	"idConcert"	INTEGER NOT NULL,
	"seat" TEXT NOT NULL,
	FOREIGN KEY (idUser) REFERENCES users(idUser)
	FOREIGN KEY (idConcert) REFERENCES concerts(idConcert)

);

INSERT INTO "users" ("idUser","email","name","salt","hPassword","loyal") VALUES (1,'enrico@test.com','Enrico', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb', 1); /* password='pwd' */
INSERT INTO "users" ("idUser","email","name","salt","hPassword","loyal") VALUES (2,'luigi@test.com','Luigi',   '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c', 1);
INSERT INTO "users" ("idUser","email","name","salt","hPassword","loyal") VALUES (3,'alice@test.com','Alice',   'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160', 0);
INSERT INTO "users" ("idUser","email","name","salt","hPassword","loyal") VALUES (4,'harry@test.com','Harry',   'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8', 0);

INSERT INTO "theatre_types" ("idType","theatreType","rows","columns") VALUES (1, 'Small', 4, 8);
INSERT INTO "theatre_types" ("idType","theatreType","rows","columns") VALUES (2, 'Medium', 6, 10);
INSERT INTO "theatre_types" ("idType","theatreType","rows","columns") VALUES (3, 'Large', 9, 14); 

INSERT INTO "theatres" ("idTheatre","nameTheatre","idType") VALUES (1, 'Verdi', 1);
INSERT INTO "theatres" ("idTheatre","nameTheatre","idType") VALUES (2, 'Rossi', 2);
INSERT INTO "theatres" ("idTheatre","nameTheatre","idType") VALUES (3, 'Bianchi', 3); 

INSERT INTO "concerts" ("idConcert","nameConcert","idTheatre","freeSeats") VALUES (1, 'Teddy Swims', 1, 20);
INSERT INTO "concerts" ("idConcert","nameConcert","idTheatre","freeSeats") VALUES (2, 'Lady Gaga', 2, 59);
INSERT INTO "concerts" ("idConcert","nameConcert","idTheatre","freeSeats") VALUES (3, 'Vivaldi', 3, 126); 
INSERT INTO "concerts" ("idConcert","nameConcert","idTheatre","freeSeats") VALUES (4, 'Taylor Swift', 1, 32); 
INSERT INTO "concerts" ("idConcert","nameConcert","idTheatre","freeSeats") VALUES (5, 'Sfera Ebbasta', 2, 60); 
INSERT INTO "concerts" ("idConcert","nameConcert","idTheatre","freeSeats") VALUES (6, 'Lady Gaga', 3, 126); 

INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (1, 1, 1, '1A');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (2, 1, 1, '1B');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (3, 1, 1, '1C');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (4, 1, 1, '2A');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (5, 1, 1, '3A');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (6, 1, 1, '4A');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (7, 1, 1, '4B');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (8, 1, 1, '4C');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (9, 1, 1, '3C');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (10, 1, 1, '1D');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (11, 1, 1, '2D');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (12, 1, 1, '3D');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (13, 1, 1, '4D');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (14, 1, 1, '1E');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (15, 1, 1, '1F');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (16, 1, 1, '2F');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (17, 1, 1, '3F');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (18, 1, 1, '4F');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (19, 1, 1, '3E');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (20, 1, 1, '1H');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (21, 1, 1, '2H');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (22, 1, 1, '3H');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (23, 1, 1, '4H');
INSERT INTO "reservations" ("idReservation","idUser","idConcert","seat") VALUES (24, 1, 2, '3H');


COMMIT;