import { useEffect, useState } from 'react';
import { Row, Col, Card, Accordion, Button, Modal, OverlayTrigger, Tooltip, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import { SuccessToast } from './toastComponent';


function MainPage(props) {
    const { loggedIn, showToastType, discount, setDiscount, dirty, setDirty, showToast, handleShowAndTypeToast } = props;
    const [concerts, setConcerts] = useState([]);
    const [userReservations, setUserReservations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentConcert, setCurrentConcert] = useState(undefined);
    const navigate = useNavigate();

    useEffect(() => {

        if (dirty || !loggedIn) {
            API.getAllConcerts()
                .then((allConcerts) => { setConcerts(allConcerts); })
                .catch((err) => console.log(err));

            API.getUserReservations()
                .then((allUserReservations) => { setUserReservations(allUserReservations); })
                .catch((err) => {
                    console.log(err);
                    setUserReservations([])
                });

            setDirty(false);
        }

    }, [dirty, loggedIn]);

    const isConcertReserved = (idConcert) => {
        return userReservations.some(reservation => reservation.idConcert === idConcert);
    };

    const handleConcertClick = (idConcert) => {
        if (!isConcertReserved(idConcert)) {
            setDirty(true);
            handleShowAndTypeToast();
            navigate(`/reservation/${idConcert}`);
        }
    };

    const handleDeleteClick = (idConcert) => {
        setShowModal(true);
        setCurrentConcert(idConcert);
    };

    const handleReservationDelete = (currentConcert) => {
        API.deleteReservation(currentConcert)
            .then(() => setCurrentConcert(undefined))
            .then(() => setShowModal(false))
            .then(() => setDirty(true))
            .then(() => setDiscount(undefined))
            .catch((err) => console.log(err));

    };

    return (
        <>
            {showToastType === 1 ? <SuccessToast showToast={showToast} handleShowAndTypeToast={handleShowAndTypeToast}/> : null}
            <Row>
                <Concerts
                    concerts={concerts}
                    isConcertReserved={isConcertReserved}
                    handleConcertClick={handleConcertClick}
                    loggedIn={loggedIn}
                />
                <UserReservation
                    loggedIn={loggedIn}
                    userReservations={userReservations}
                    handleDeleteClick={handleDeleteClick}
                    discount={discount}
                    setDiscount={setDiscount}
                />
            </Row>
            <MyModal
                showModal={showModal}
                setShowModal={setShowModal}
                currentConcert={currentConcert}
                handleReservationDelete={handleReservationDelete}
            />
        </>
    );

}

function Concerts(props) {
    const { concerts, isConcertReserved, handleConcertClick } = props

    const getBadgeVariant = (freeSeats) => {
        return freeSeats > 0 ? 'success' : 'danger';
    };

    return (
        <Col md={8} style={{ height: '88vh', overflowY: 'auto' }}>
            <h1 className="title">Concerts</h1>
            <div style={{ height: 'calc(100% - 4rem)', overflowY: 'auto', marginTop: '1rem', overflowX: 'hidden' }}>
                <Row className="justify-content-center">
                    {concerts.map((concert) => {
                        const reserved = isConcertReserved(concert.idConcert);
                        return (
                            <Col key={concert.idConcert} md={4} className="mb-4 d-flex justify-content-center">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={reserved ? <Tooltip>You already have a reservation for this concert</Tooltip> : <></>}
                                >
                                    <Card
                                        onClick={() => handleConcertClick(concert.idConcert)}
                                        style={{
                                            cursor: reserved ? 'not-allowed' : 'pointer',
                                            width: '100%',
                                            maxWidth: '300px',
                                            opacity: reserved ? 0.5 : 1,
                                            border: reserved ? '2px solid red' : '2px solid green'
                                        }}
                                    >
                                        <Card.Body
                                            style={{
                                                backgroundColor: reserved ? 'rgba(255, 0, 0, 0.1)' : 'rgba(116, 245, 116, 0.1)'
                                            }}
                                        >
                                            <Card.Title>{concert.nameConcert}</Card.Title>
                                            <Card.Text>
                                                <strong>Theatre:</strong> {concert.nameTheatre}<br />
                                                <strong>Size:</strong> {concert.theatreType}<br />
                                                <strong>Seats available: </strong>
                                                <Badge bg={getBadgeVariant(concert.freeSeats)}>
                                                    {concert.freeSeats}
                                                </Badge><br />
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </OverlayTrigger>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </Col>
    )
}

function UserReservation(props) {
    const { loggedIn, userReservations, handleDeleteClick, discount, setDiscount } = props

    return (
        <Col md={4} style={{ height: '88vh', overflowY: 'auto' }}>
            <h1 className='title'>Your Reservations</h1>
            <div style={{ height: 'calc(100% - 4rem)', overflowY: 'auto', marginTop: '1rem', overflowX: 'hidden' }}>
                {
                    !loggedIn ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                            <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>You must login to see your reservations</h2>
                        </div>
                    ) : (
                        userReservations.length > 0 ? (
                            <Accordion>
                                {userReservations.map((userReservation, index) => (
                                    <Accordion.Item eventKey={index.toString()} key={index}>
                                        <Accordion.Header>
                                            {userReservation.nameConcert} - {userReservation.nameTheatre}
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Row>
                                                <Col>
                                                    <strong>N° of seats reserved:</strong> {userReservation.seats.length}<br />
                                                    <strong>Seats:</strong> {userReservation.seats.join(', ')}
                                                </Col>
                                            </Row>
                                            <Row className="mt-3">
                                                <Col className="d-flex justify-content-end">
                                                    <Button
                                                        variant="danger"
                                                        className="btn-sm"
                                                        onClick={() => { handleDeleteClick(userReservation.idConcert) }}
                                                    >
                                                        <i className="bi bi-trash"></i> Delete
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                                <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>You do not have any reservation</h2>
                            </div>
                        )
                    )
                }
                {discount && loggedIn && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={() => setDiscount(null)}
                        className="mt-3"
                    >
                        <b>Your discount for next season is:</b> {discount} %
                    </Alert>
                )}
            </div>
        </Col>
    );
}


function MyModal(props) {
    const { showModal, setShowModal, currentConcert, handleReservationDelete } = props

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Cancel reservation Definitely</Modal.Title>
            </Modal.Header>
            <Modal.Footer className="d-flex justify-content-between">
                <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                >
                    Go back
                </Button>
                <Button
                    variant="danger"
                    onClick={() => handleReservationDelete(currentConcert)}
                >
                    Delete reservation
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { MainPage };
