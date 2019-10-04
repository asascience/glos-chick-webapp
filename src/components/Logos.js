import React from 'react';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import glosLogo from '../logos/GLOSLogo_and_Name_horizontal.png';
import glerlLogo from '../logos/US-GreatLakesEnvironmentalResearchLaboratory.png';
import ciglrLogo from '../logos/CIGLR-LOGO.png';
import osuLogo from '../logos/OSU_Stacked_RedBlack.png';
import cwaLogo from '../logos/Cleveland_Water_Alliance_CWA-logo.png';
import nccosLogo from '../logos/NCCOSLogo.png';
import rpsLogo from '../logos/rps.jpg';
import limnoLogo from '../logos/LimnoTech_Logo.png';
import './Logos.css';

export default class Logos extends React.Component {
  render = () => {
    return (
      <Container className="logos">
        <Row style={{paddingTop: '20px'}}>
          <Col lg={3} sm={6} xs={12}>
            <img src={glosLogo} alt="glosLogo"/>
          </Col>
          <Col lg={3} sm={6} xs={12}>
            <img src={glerlLogo} alt="glerlLogo"/>
          </Col>
          <Col lg={3} sm={6} xs={12}>
            <img src={ciglrLogo} alt="ciglrLogo"/>
          </Col>
          <Col lg={3} sm={6} xs={12}>
            <img src={osuLogo} alt="osuLogo"/>
          </Col>
        </Row>
        <Row style={{paddingTop: '20px'}}>
          <Col lg={3} sm={6} xs={12}>
            <img src={cwaLogo} alt="cwaLogo"/>
          </Col>
          <Col lg={3} sm={6} xs={12}>
            <img src={nccosLogo} alt="nccosLogo"/>
          </Col>
          <Col lg={3} sm={6} xs={12}>
            <img src={rpsLogo} alt="RPSLogo"/>
          </Col>
          <Col lg={3} sm={6} xs={12}>
            <img src={limnoLogo} alt="limnoLogo"/>
          </Col>
        </Row>
      </Container>
    );
  }
}
