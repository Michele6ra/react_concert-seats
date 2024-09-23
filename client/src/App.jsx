import { Navigation } from './components/navbarComponent.jsx';
import { LoginForm } from './components/loginComponent';
import { MainPage } from './components/mainPageComponent.jsx';
import { Container } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import API from './API';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import ConcertDetails from './components/concertDetailsComponent.jsx';

function Layout() {
  return (
    <Container fluid style={{ paddingTop: '5rem' }}>
      <Outlet />
    </Container>
  )
}

//routing Login
function LoginRoute(props) {
  const { loginSuccessful } = props;
  return (
    <Container fluid style={{ paddingTop: '5rem' }}>
      <LoginForm loginSuccessful={loginSuccessful} />
    </Container>
  );
}

//default routing 
function DefaultRoute() {
  return (
    <Container fluid>
      <p className="my-2">No data here: This is not a valid page!</p>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}

function App() {

  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showToastType, setShowToastType] = useState(undefined);
  const [authToken, setAuthToken] = useState(null);
  const [discount, setDiscount] = useState(undefined);
  const [dirty, setDirty] = useState(true);
  const [showToast, setShowToast] = useState(false);
    
  const handleShowAndTypeToast = () => {
    setShowToast(false);
    setShowToastType(undefined);
  }

  useEffect(() => {
    API.getUserInfo().then((user) => {
      setLoggedIn(true);
      setUser(user);
      reNewToken();
      setDirty(true);
    })
      .catch((err) => console.log(err));
  }, []);

  async function reNewToken() {
    try {
      const newObjToken = await API.getAuthToken();
      setAuthToken(newObjToken.token);
      return newObjToken.token;
    } catch (err) {
      console.error("Failed to renew token", err);
      throw err;
    }
  }

  const doLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(undefined);
    setAuthToken(null);
    setDirty(true);
    setDiscount(undefined);
  };

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    API.getAuthToken()
      .then((resp) => setAuthToken(resp.token))
      .catch((err) => console.log(err));
    setDirty(true);
  };

  async function handleDiscount(listSeats) {
    try {
      const seasonDiscount = await API.getDiscount(authToken, listSeats);
      setDiscount(seasonDiscount.discount);
      setDirty(true);
    } catch (err) {
      console.log(err);
      setDiscount(undefined);
      try {
        const newToken = await reNewToken();
        const seasonDiscount = await API.getDiscount(newToken, listSeats);
        setDiscount(seasonDiscount.discount);
        setDirty(true);
      } catch (err) {
        console.log(err);
      }
    }
  }

  function handleGoBack() {
    setDirty(true);
    handleShowAndTypeToast();
  }

  return (
    <>
      <BrowserRouter>
        <Navigation user={user} loggedIn={loggedIn} doLogout={doLogout} />
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<MainPage loggedIn={loggedIn} showToastType={showToastType} discount={discount} setDiscount={setDiscount} dirty={dirty} setDirty={setDirty} showToast={showToast} handleShowAndTypeToast={handleShowAndTypeToast}/>} />
            <Route path='/reservation/:idConcert' element={<ConcertDetails loggedIn={loggedIn} showToastType={showToastType} handleDiscount={handleDiscount} handleGoBack={handleGoBack} dirty={dirty} setDirty={setDirty} showToast={showToast} setShowToast={setShowToast} handleShowAndTypeToast={handleShowAndTypeToast} setShowToastType={setShowToastType}/>} />
          </Route>
          <Route path='/login' element={<LoginRoute loginSuccessful={loginSuccessful} />} />
          <Route path='/*' element={<DefaultRoute />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
