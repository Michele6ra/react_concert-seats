import { Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import API from '../API.js';

function LoginForm(props) {
    const [username, setUsername] = useState('enrico@test.com');
    const [password, setPassword] = useState('pwd');
    const [errorMessage, setErrorMessage] = useState('');
    const [isVisible, setVisible] = useState(false);
    const navigate = useNavigate();

    const { loginSuccessful } = props;

    const handlePassword = () => {
        setVisible(!isVisible);
    };
    const doLogIn = (credentials) => {
        API.logIn(credentials)
            .then((user) => {
                setErrorMessage('');
                loginSuccessful(user);
                navigate('/');
            })
            .catch((err) => {
                console.log(err);
                setErrorMessage('Wrong username or password');
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        if (username.trim() === '' || password.trim() === '') {
            setErrorMessage('Username and password must not be empty.');
            return;
        }
        const credentials = { username, password };
        doLogIn(credentials);
    };

    return (
        <Container>
            <Row>
                <Col
                    xs={12}
                    md={{ span: 6, offset: 3 }}>
                    <h1 className="title">Login</h1>
                    {errorMessage && (
                        <Alert
                            variant="danger"
                            dismissible onClose={() => setErrorMessage('')}>
                            {errorMessage}
                        </Alert>
                    )}
                    <Form
                        onSubmit={handleSubmit}>
                        <Form.Group
                            controlId="username"
                            style={{ marginBottom: '1.0rem' }}>
                            <Form.Label>
                                <i className="bi bi-person"></i>
                                <span
                                    className="icon-label">
                                    <b>Email</b>
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Insert email"
                                value={username}
                                onChange={(ev) => setUsername(ev.target.value)}
                            />
                        </Form.Group>
                        <Form.Group
                            controlId="password">
                            <Form.Label>
                                <i className="bi bi-lock"></i>
                                <span className="icon-label"><b>Password</b></span>
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={isVisible ? 'text' : 'password'}
                                    placeholder="Insert password"
                                    value={password}
                                    onChange={(ev) => setPassword(ev.target.value)}
                                />
                                <Button
                                    variant="dark"
                                    onClick={handlePassword}>
                                    {isVisible ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </Button>
                            </InputGroup>
                        </Form.Group>
                        <Row
                            className="mb-3 pt-2 justify-content-center">
                            <Form.Group
                                as={Col}
                                className="d-flex mt-3 justify-content-between">
                                <Button
                                    variant="warning"
                                    className="mb-3"
                                    onClick={() => navigate('/')}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="mb-3">
                                    Login
                                </Button>
                            </Form.Group>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export { LoginForm };