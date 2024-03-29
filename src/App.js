import { LinkContainer } from 'react-router-bootstrap';
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import IdleTimer from 'react-idle-timer'
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import glosLogo from './logos/glos_logo.png';
import Routes from './Routes';
import { Auth } from 'aws-amplify';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faArrowCircleUp, faArrowCircleDown, faBell, faHome, faSignOutAlt, faInfoCircle, faPlayCircle, faPauseCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './App.css';

library.add(faSpinner);
library.add(faArrowCircleUp);
library.add(faArrowCircleDown);
library.add(faHome);
library.add(faBell);
library.add(faSignOutAlt);
library.add(faInfoCircle);
library.add(faPlayCircle);
library.add(faPauseCircle);
library.add(faExternalLinkAlt);

const IDLE_TIMEOUT = 1000 * 60 * 30; // 30 minutes
const ACTIVITY_DEBOUNCE = 250; // ms

class App extends Component {
  constructor(props) {
    super(props);

    this.idleTimer = null;
    this.onIdle = this.onIdle.bind(this);

    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      userEmail: null
    };
  }

  async componentDidMount() {
    try {
      if (await Auth.currentSession()) {
        this.userHasAuthenticated(true);
      }
    } catch (e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }
    this.setState({ isAuthenticating: false });
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  };

  handleLogout = async event => {
    await Auth.signOut();

    this.userHasAuthenticated(false);
    this.props.history.push('/login');
  };

  onIdle = () => {
    this.handleLogout();
  };

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    };
    if (this.state.isAuthenticated && !this.state.userEmail) {
      Auth.currentAuthenticatedUser({
        bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
      }).then(user => this.setState({userEmail: user.attributes.email}))
      .catch(err => console.log(err));
    }

    return (
      <div className="App container-fluid">
        <IdleTimer
            ref={ref => { this.idleTimer = ref }}
            element={document}
            onIdle={this.onIdle}
            debounce={ACTIVITY_DEBOUNCE}
            timeout={IDLE_TIMEOUT}
        />
        <Navbar bg="glos" expand="lg" fluid collapseOnSelect>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
              {this.state.isAuthenticated ? (
                <Nav className="mr-auto">
                  <LinkContainer to="/">
                    <Nav.Item bsPrefix='nav'>Home</Nav.Item>
                  </LinkContainer>
                  <LinkContainer to="/alerts">
                    <Nav.Item bsPrefix='nav'>&nbsp;|&nbsp;Alerts</Nav.Item>
                  </LinkContainer>
                </Nav>
              ) : (
                <Nav className="mr-auto">
                </Nav>
              )
            }
            <Navbar.Brand href={'http://glos.us'}>
              <img
                  alt={'Glos Logo'}
                  src={glosLogo}
                  height={40}
                  className="d-inline-block align-middle"
              />
            </Navbar.Brand>
            <Nav>
              {this.state.isAuthenticated ? (
                <NavDropdown bsPrefix='navbar-link' title={this.state.userEmail}>
                  <NavDropdown.Item eventKey="3" onClick={this.handleLogout}><FontAwesomeIcon icon='sign-out-alt' style={{'marginRight': '7px'}} />Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Fragment>
                  <LinkContainer to="/signup">
                    <Nav.Item bsPrefix='navbar-link'>Signup</Nav.Item>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Nav.Item bsPrefix='navbar-link'>Login</Nav.Item>
                  </LinkContainer>
                </Fragment>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);
