import React from 'react';
import { Toast } from 'react-bootstrap';

function SuccessToast(props) {
    const { showToast, handleShowAndTypeToast } = props;

    return (
        <div className="custom-toast-container">
            <Toast 
                onClose={() => handleShowAndTypeToast()} 
                show={showToast} 
                delay={5000} 
                autohide
                className={`custom-toast-success ${showToast ? 'toast-animate-in' : 'toast-animate-out'}`}
            >
                <Toast.Header>
                    <strong className="me-auto">Success</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body>Reservation completed successfully!</Toast.Body>
            </Toast>
        </div>
    );
}

function ErrorToast(props) {
    const { showToast, handleShowAndTypeToast } = props;  

    return (
        <div className="custom-toast-container">
            <Toast 
                onClose={() => handleShowAndTypeToast()} 
                show={showToast} 
                delay={5000} 
                autohide
                className={`custom-toast-error ${showToast ? 'toast-animate-in' : 'toast-animate-out'}`}
            >
                <Toast.Header>
                    <strong className="me-auto">Error</strong>
                    <small>Just now</small>
                </Toast.Header>
                <Toast.Body>Reservation failed! Some seats are not available anymore</Toast.Body>
            </Toast>
        </div>
    );
}

export {SuccessToast, ErrorToast};
