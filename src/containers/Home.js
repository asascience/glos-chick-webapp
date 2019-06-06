import React, { Component } from 'react';
import StationMap from '../components/Map'
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
      <div className="lander">
        <h1>GLOS HABS Prototype Demo App</h1>
      </div>
    );
  }

  renderMap() {
    return (
        <div className="home-container">
            <StationMap/>
        </div>
    );
  }

  render() {
    return <div className="Home">{this.props.isAuthenticated ? this.renderMap() : this.renderLander()}</div>;
  }
}
