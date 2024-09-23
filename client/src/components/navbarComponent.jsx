import { Navbar, Button, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Navigation(props) {
  const { user, loggedIn, doLogout } = props;
  const name = user && user.name;
  const navigate = useNavigate();

  const handleLogout = () => {
    doLogout();
    navigate("/")
  }

  return (
    <Navbar bg="dark" className="navbar navbar-dark fixed-top navbar-padding">
      <Container className="navbar-brand">
        <Nav>
          <i className="bi bi-ticket-detailed ms-3"></i>
          <span className="ms-3">Concert Seats</span>
        </Nav>
      </Container>
      <Container className="justify-content-center navbar-brand">
      </Container>
      <Container className="navbar-brand justify-content-end">
        <Nav className="align-items-center">
          <i className="bi bi-person-circle user-icon me-2  ms-1"></i>
          {loggedIn ? (
            <>
              <span className="text-white me-3 ms-1">Welcome, {name}</span>
              <Button className="btn btn-light btn-sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <span className="text-white me-3  ms-1">Guest User</span>
              <Link to="/login" className="btn btn-light btn-sm">Login</Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  )
}

export { Navigation }