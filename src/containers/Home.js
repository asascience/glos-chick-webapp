import React, { Component } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import StationMap from '../components/Map';
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
          <div class="container">
            <h1>Lake Erie Early Warning System</h1>
            <h1>Prototype</h1>
            <h4 style={{paddingTop: '20px'}}>This prototype is intended to showcase blah blah</h4>
            <h4>blah blah</h4>
            <Container>
              <Row style={{paddingTop: '20px'}}>
                <Col sm={3}/>
                <Col sm={6}>
                  <LinkContainer to="/signup">
                    <Button size="lg" block variant='info'>SIGN UP</Button>
                  </LinkContainer>
                </Col>
                <Col sm={3}/>
              </Row>
              <Row style={{paddingTop: '20px'}}>
                <Col sm={3}/>
                <Col sm={6}>
                  <LinkContainer to="/login">
                    <Button size="lg" block variant='info'>LOGIN</Button>
                  </LinkContainer>
                </Col>
                <Col sm={3}/>
              </Row>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  renderMap() {
    return (
      <div className='home-container'>
        <StationMap/>
      </div>
    );
  }

  render() {
    return <div className='Home'>{this.props.isAuthenticated ? this.renderMap() : this.renderLander()}</div>;
  }
}
