import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Accordion, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { ErrorToast } from './toastComponent';

import API from '../API';

function ConcertDetails(props) {
    const { loggedIn, showToastType, handleDiscount, handleGoBack, dirty, setDirty, showToast, setShowToast, handleShowAndTypeToast, setShowToastType } = props;
    const { idConcert } = useParams();
    const [concert, setConcert] = useState(undefined);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [oldSelectedSeats, setOldSelectedSeats] = useState([]);
    const [autoSeats, setAutoSeats] = useState(0);
    const [totalSeats, setTotalSeats] = useState(0);
    const [occupiedSeats, setOccupiedSeats] = useState(0);
    const [freeSeats, setFreeSeats] = useState(0);
    const [activeAccordionKey, setActiveAccordionKey] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (dirty) {
            async function updatedGrid() {
                const currentConcert = await API.getConcertById(idConcert);
                setConcert(currentConcert);
                const updatedSelectedSeats = selectedSeats.filter(
                    (seat) => !currentConcert.seats.includes(seat)
                );
                setSelectedSeats(updatedSelectedSeats);
                resetStatistics(currentConcert, updatedSelectedSeats.length);
                return currentConcert;
            }
            updatedGrid();
            setDirty(false);
        }
    }, [dirty, selectedSeats]);

    function resetStatistics(concert, updatedSelectedSeats) {
        const total = concert.rows * concert.columns;
        const free = concert.freeSeats - updatedSelectedSeats;
        const occupied = total - free;
        setTotalSeats(total);
        setOccupiedSeats(occupied);
        setFreeSeats(free);
    }

    function generateAlphabetArray(columns) {
        const alphabet = [];
        const startCharCode = 65;

        for (let i = 0; i < columns; i++) {
            const charCode = startCharCode + (i % 26);
            alphabet.push(String.fromCharCode(charCode));
        }
        return alphabet;
    }

    const handleSeatClick = (row, col) => {
        const seatLabel = `${row}${col}`;
        if (!selectedSeats.includes(seatLabel)) {
            setSelectedSeats([...selectedSeats, seatLabel]);
            setOccupiedSeats((occupiedSeats) => occupiedSeats + 1);
            setFreeSeats((freeSeats) => freeSeats - 1)
        } else {
            setSelectedSeats(selectedSeats.filter(seat => seat !== seatLabel));
            setOccupiedSeats((occupiedSeats) => occupiedSeats - 1);
            setFreeSeats((freeSeats) => freeSeats + 1)
        }
    };

    const confirmSelection = () => {
        // Manual selection
        if (activeAccordionKey == 0) {
            setOldSelectedSeats(selectedSeats);
            API.createReservation(idConcert, selectedSeats)
                .then((response) => {
                    if (response.status == 200) {
                        console.log(showToast)
                        setShowToast(true)
                        setShowToastType(1);
                        setShowModal(false);
                        handleDiscount(selectedSeats);
                        navigate('/');
                    } else if (response.status == 409) {
                        setDirty(true);
                        setShowToast(true)
                        setShowToastType(2);
                        setShowModal(false);
                    }
                })
                .catch((err) => console.log(err));
        } else { // Automatic selection
            // Find free seats
            const availableSeats = [];
            for (let row = 1; row <= concert.rows; row++) {
                const alphabetArray = generateAlphabetArray(concert.columns);
                for (let col of alphabetArray) {
                    const seatLabel = `${row}${col}`;
                    if (!concert.seats.includes(seatLabel)) {
                        // Seat is free if not in concert.seats
                        availableSeats.push(seatLabel);
                    }
                }
            }
            // Select the first 'autoSeats' number of available seats
            const seatsToReserve = availableSeats.slice(0, autoSeats);
            setOldSelectedSeats(seatsToReserve);
            // Proceed to create a reservation with the selected seats
            API.createReservation(idConcert, seatsToReserve)
                .then((response) => {
                    if (response.status == 200) {
                        setShowToastType(1);
                        handleDiscount(seatsToReserve);
                        navigate('/');
                    } else if (response.status == 409) {
                        setDirty(true);
                        setShowToastType(2);
                    }
                })
                .catch((err) => console.log(err));
        }
    };

    const clearSelection = () => {
        setSelectedSeats([]);
        resetStatistics(concert, 0);
    };

    //to view or not the selected seats
    const handleAccordionSelect = (eventKey) => {
        setActiveAccordionKey(eventKey);
        if (eventKey != 0) {
            clearSelection();
        }
    };

    return (
        <>
            {showToastType == 2 ? <ErrorToast showToast={showToast} handleShowAndTypeToast={handleShowAndTypeToast}/> : null}
            <Row>
                <SeatMapComponent concert={concert} activeAccordionKey={activeAccordionKey} selectedSeats={selectedSeats} showToastType={showToastType} loggedIn={loggedIn} oldSelectedSeats={oldSelectedSeats} generateAlphabetArray={generateAlphabetArray} handleSeatClick={handleSeatClick} handleGoBack={handleGoBack} />
                <StatisticAndConfirmation concert={concert} freeSeats={freeSeats} occupiedSeats={occupiedSeats} totalSeats={totalSeats} selectedSeats={selectedSeats} loggedIn={loggedIn} autoSeats={autoSeats} setAutoSeats={setAutoSeats} confirmSelection={confirmSelection} clearSelection={clearSelection} handleAccordionSelect={handleAccordionSelect} setShowModal={setShowModal} />
            </Row>
            <MyModal showModal={showModal} setShowModal={setShowModal} confirmSelection={confirmSelection} />
        </>
    );
}

function SeatMapComponent(props) {
    const { concert, activeAccordionKey, selectedSeats, showToastType, loggedIn, oldSelectedSeats, generateAlphabetArray, handleSeatClick, handleGoBack } = props;
    const navigate = useNavigate();
    const goBackClick = () => {
        handleGoBack();
        navigate('/');
    }

    return (<Col
        xs={8}
        className="d-flex flex-column align-items-center">
        <Row
            className="w-100 d-flex align-items-center justify-content-between">
            <Col
                className="text-center flex-grow-1">
                <h1 className="title mb-0">Choose your seat(s)</h1>
            </Col>
        </Row>
        <div
            className="seatmap-container">
            {concert && Array.from({ length: concert.rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="seatmap-row d-flex justify-content-center">
                    {generateAlphabetArray(concert.columns).map((col, colIndex) => (
                        <div
                            key={colIndex}
                            className={`seatmap-seat ${activeAccordionKey == 0 && selectedSeats.includes(`${rowIndex + 1}${col}`) ? 'selected' : ''} 
                                                                ${!loggedIn ? 'readonly' : ''} 
                                                                ${concert.seats.includes(`${rowIndex + 1}${col}`) ? 'occupied readonly' : ''}
                                                                ${showToastType == 2 && concert.seats.includes((`${rowIndex + 1}${col}`)) && oldSelectedSeats.includes((`${rowIndex + 1}${col}`)) ? 'blinking' : ''}`}
                            onClick={loggedIn && activeAccordionKey == 0 ? () => handleSeatClick(rowIndex + 1, col) : null}
                        >
                            {rowIndex + 1}{col}
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <Button
            variant="light"
            onClick={() => goBackClick()}
            className="back"
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#333333';
                e.target.style.color = '#CCCCCC';
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#CCCCCC';
                e.target.style.color = '#333333';
            }}
        >
            <i className="bi bi-arrow-bar-left"></i>
        </Button>
    </Col>)
}

function StatisticAndConfirmation(props) {
    const { concert, freeSeats, occupiedSeats, totalSeats, selectedSeats, loggedIn, autoSeats, setAutoSeats, confirmSelection, clearSelection, handleAccordionSelect, setShowModal } = props
    return (
        <>
            <Col
                xs={4}>
                {concert && (
                    <>
                        <h1 className='title'>Concert Statistics</h1>
                        <h6><strong>Concert:</strong> {concert.nameConcert}</h6>
                        <h6><strong>Theatre:</strong> {concert.nameTheatre}</h6>
                        <h6><strong>Size:</strong> {concert.theatreType}</h6>
                        <ul>
                            <li><strong>Free seats:</strong> {freeSeats}</li>
                            <li><strong>Occupied seats:</strong> {occupiedSeats}</li>
                            <li><strong>Total seats:</strong> {totalSeats}</li>
                        </ul>
                    </>
                )
                }
                {loggedIn ?
                    <Accordion
                        defaultActiveKey="0"
                        className="mt-3"
                        onSelect={handleAccordionSelect}>
                        <Accordion.Item
                            eventKey="0">
                            <Accordion.Header>Manual Seat Selection</Accordion.Header>
                            <Accordion.Body>
                                <h6><strong>Selected seats:</strong> {selectedSeats.length}</h6>
                                <Row
                                    className="d-flex align-items-stretch">
                                    <Col
                                        className="d-flex">
                                        <Button
                                            variant="primary"
                                            onClick={() => setShowModal(true)}
                                            className="w-100 me-2 d-flex justify-content-center align-items-center"
                                            disabled={selectedSeats.length < 1}
                                        >
                                            Confirm Manual Selection
                                        </Button>
                                    </Col>
                                    <Col
                                        className="d-flex">
                                        <Button
                                            variant="warning"
                                            onClick={clearSelection}
                                            className="w-100 ms-2 d-flex justify-content-center align-items-center"
                                            disabled={selectedSeats.length < 1}
                                        >
                                            Clear Current Selection
                                        </Button>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item
                            eventKey="1">
                            <Accordion.Header>Automatic Seat Selection</Accordion.Header>
                            <Accordion.Body>
                                <Form>
                                    <InputGroup
                                        className="mb-3">
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter number of seats"
                                            min="1"
                                            max={freeSeats}
                                            value={autoSeats}
                                            onChange={(e) => setAutoSeats(e.target.value)}
                                        />
                                    </InputGroup>
                                </Form>
                                <Button
                                    variant="primary"
                                    onClick={() => confirmSelection()}
                                    disabled={autoSeats < 1 || autoSeats > freeSeats}
                                >
                                    Confirm Automatic Selection
                                </Button>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    :
                    <h2>You must login to perform a reservation for this concert</h2>
                }
            </Col>
        </>)
}

function MyModal(props) {
    const { showModal, setShowModal, confirmSelection } = props
    return (<Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Are you sure you want this reservation?</Modal.Title>
        </Modal.Header>
        <Modal.Footer
            className="d-flex justify-content-between">
            <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
            >
                Go back
            </Button>
            <Button
                variant="success"
                onClick={() => confirmSelection()}
            >
                Confirm reservation
            </Button>
        </Modal.Footer>
    </Modal>)
}

export default ConcertDetails;
