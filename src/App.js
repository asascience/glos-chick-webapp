import { LinkContainer } from 'react-router-bootstrap';
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import NavDropdown from 'react-bootstrap/NavDropdown'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar';
import glosLogo from './logos/glos_logo.png';
import Routes from './Routes';
import { Auth } from 'aws-amplify';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faArrowCircleUp, faArrowCircleDown } from '@fortawesome/free-solid-svg-icons'
import './App.css';

library.add(faSpinner)
library.add(faArrowCircleUp)
library.add(faArrowCircleDown)


class App extends Component {
  constructor(props) {
    super(props);

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
      <div className="App container">
        <Navbar bg="light" expand="lg" fluid collapseOnSelect>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <LinkContainer to="/">
                <Nav.Item bsPrefix='nav'>Home</Nav.Item>
              </LinkContainer>
            </Nav>
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
                <NavDropdown title={this.state.userEmail}>
                    <NavDropdown.Item onClick={this.handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Fragment>
                  <LinkContainer to="/signup">
                    <Nav.Item bsPrefix='nav-link'>Signup</Nav.Item>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Nav.Item bsPrefix='nav-link'>Login</Nav.Item>
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
