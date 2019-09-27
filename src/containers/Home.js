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
          <div className="container">
            <h1>Lake Erie Early Warning System</h1>
            <h1>Prototype</h1>
            <h4 align='left' style={{paddingTop: '20px'}}>Welcome!</h4>
            <p align='left'>This app is a way to provide the latest information on western Lake Erie harmful algal blooms to stakeholders of all kinds,We
               want to make sure this critical information needs to be accessible whether people are using a mobile device or sitting at their
               desktop.</p>
            <p align='left'>Thank you for helping us as we develop what we hope will be a valuable tool for those making critical water treatment
               decisions.</p>

            <p align='left'>At this phase of development, the app shows information taken from 1) sensors mounted on buoys and water intakes, 2)
               toxicity measurements from field samples, 3) the NOAA Great Lakes Environmental Research Laboratory (GLERL) Experimental
               Lake Erie HAB Tracker forecast model, and 4) another forecast model called the GLERL Great Lakes Coastal Forecasting
               System (GLCFS) that predicts water current direction and speed.</p>

            <p align='left'>As this project expands, we will include more data on both HABs and hypoxia.</p>

            <p align='left'>Please explore the prototype, and, as always, let us know your thoughts using the widget in the lower right hand corner. Your
            feedback is invaluable. </p>

            <p align='left'>Read more on the project and the products that provide the data here.</p>
            <Container>
              <Row style={{paddingTop: '20px'}}>
                <Col sm={3}/>
                <Col sm={3}>
                  <LinkContainer to="/signup">
                    <Button size="lg" block variant='warning'>SIGN UP</Button>
                  </LinkContainer>
                </Col>
                <Col sm={3}>
                  <LinkContainer to="/login">
                    <Button size="lg" block variant='warning'>LOGIN</Button>
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
        <StationMap showForecast={true}/>
      </div>
    );
  }

  render() {
    return <div className='Home'>{this.props.isAuthenticated ? this.renderMap() : this.renderLander()}</div>;
  }
}
