import React, { Component } from 'react';
import Moment from 'react-moment';
import BootstrapTable from 'react-bootstrap-table-next';
import { PageHeader, ListGroup, Table } from 'react-bootstrap';
import { API } from 'aws-amplify';
import {json as requestJson} from 'd3-request';
import GaugePlot from './GaugePlot'
import TimeSeriesPlot from './TimeSeriesPlot'
import './Home.css';



export default class StationDashboard extends Component {
    constructor(props) {
      super(props);

      this.state = {
        x: null,
        y: null,
        isLoading: true,
        data: null,
        stream: [],
        table_columns: [],
        table_data: [],
      };

      const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
      const connection = new WebSocket(url);

      connection.onopen = () => {
        console.log('Stream opened')
      }
      connection.onmessage = e => {
        let stream = [JSON.parse(e.data)].concat(this.state.stream);
        if (stream.length >= 5) {
          stream = stream.slice(0, 5);
        }
        this.setState({
          table_columns: Object.keys(stream[0]),
          stream: stream
        })
      }
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
          <h1>Loading Data...</h1>
        </div>
      );
    }

    _renderGaugePlot() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return null;
      }
      return (
        <div>
          <GaugePlot stream={stream}/>
        </div>
      );
    }

    _renderTimeSeriesPlot() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return null;
      }
      return (
        <div>
          <TimeSeriesPlot stream={stream}/>
        </div>
      );
    }

    _renderTable() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return null;
      }
      let stationName = stream[0].station;
      let params = Object.keys(stream[0]);
      params = params.filter(item => item !== 'date' && item !== 'station');
      return (
        <div>
          <h1>Station: {stationName}</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Parameter</th>
                {stream.map((obj, idx) => {
                  return <th key={obj.date}><Moment date={obj.date} format="ddd MMM DD YYYY HH:mm" /></th>
                })}
              </tr>
            </thead>
            <tbody>
            {params.map((param, idx) => {
              return (
                <tr key={idx}>
                  <td>{param}</td>
                  {stream.map((obj, ind) => {
                    return <td key={ind}>{obj[param]}</td>
                  })}
                </tr>
              )
            })}
            </tbody>
          </Table>
        </div>
      )
    }

    renderDashboard() {
      const {stream} = this.state;
      if (stream.length === 0) {
        return (
          this.renderLander()
        )
      }

      return (
        <div className="home-container">
          <div id="plot">
            {this._renderGaugePlot()}
            {this._renderTimeSeriesPlot()}
          </div>
          <div id="table">
            {this._renderTable()}
          </div>
        </div>
      )
    }

    render() {
        // return <div className="Home">{this.props.isAuthenticated ? this.renderDashboard() : this.renderLander()}</div>;
        return <div className="Home">{this.renderDashboard()}</div>;
    }
}
