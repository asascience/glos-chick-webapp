import React, { Component } from 'react';
import { LinkContainer, Link } from 'react-router-bootstrap';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import StationMap from '../components/Map';
import Logos from '../components/Logos';
import './Home.css';


export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }
    try {
        // Test API?
    } catch (e) {
      alert(e);
    }
    this.setState({ isLoading: false });
  }

  renderLander() {
    return (
      <div className='lander'>
        <div className='jumbotron jumbotron-fluid'>
          <div className="container">
            <h1>Lake Erie Early Warning System</h1>
            <h2>Prototype</h2>
            <Container>
              <Row style={{paddingTop: '20px'}}>
                <Col sm={3}/>
                <Col xs={6} sm={3}>
                  <LinkContainer to="/signup">
                    <Button size="lg" block variant='warning'>SIGN UP</Button>
                  </LinkContainer>
                </Col>
                <Col xs={6} sm={3}>
                  <LinkContainer to="/login">
                    <Button size="lg" block variant='warning'>LOGIN</Button>
                  </LinkContainer>
                </Col>
                <Col sm={3}/>
              </Row>
            </Container>
            <h4 align='left' style={{paddingTop: '20px'}}>Welcome!</h4>
            <p align='left'>The Great Lakes Observing System and our partners have developed this web application prototype to provide the latest
              information about western Lake Erie harmful algal blooms to stakeholders of all kinds.</p>
            <p align='left'>The application’s goal is to provide actionable HAB information, when and where people need it so they can spend less
              time looking for information and more time putting it to use.</p>

            <p align='left'><i>Sign up and get started!</i></p>

            <p align='left'>Learn more about the project <a href='/project'>here</a>.</p>

            <p align='left'>Learn more about the data <a href='/data'>here</a>.</p>

            <p align='left'>The Team</p>
            <Logos/>

          </div>
        </div>
      </div>
    );
  }

  renderMap() {
    return (
      <div className='home-container'>
        <StationMap showForecast={true}/>
      </div>
    );
  }

  render() {
    return <div className='Home'>{this.props.isAuthenticated ? this.renderMap() : this.renderLander()}</div>;
  }
}
