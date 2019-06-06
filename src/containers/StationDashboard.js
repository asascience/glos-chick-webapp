import React, { Component } from 'react'
import moment from 'moment'
import BootstrapTable from 'react-bootstrap-table-next'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import GaugePlot from '../components/GaugePlot'
import TimeSeriesPlot from '../components/TimeSeriesPlot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import StationMap from '../components/Map'
import './StationDashboard.css';


export default class StationDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: null,
      stream: [],
      tableColumns: [],
      tableData: [],
      selected: ['Turb'],
      alert: false,
      alertMessage: ''
    };

    this.parameterMapping = {
      cond: 'Conductivity',
      do: 'Dissolved Oxygen Concentration',
      dosat: 'Dissolved Oxygen Saturation',
      fdomQSU: 'FDOM',
      fdomRFU: 'FDOM (RFU)',
      ph: 'pH',
      spcond: 'Specific Conductivity',
      wtmp1: 'Water Temperature',
      ysibgaraw: 'Blue Green Algae (raw)',
      ysibgarfu: 'Blue Green Algae (rfu)',
      ysibgaugl: 'Blue Green Algae (ugl)',
      ysichlraw: 'Chlorophyll (raw)',
      ysichlrfu: 'Chlorophyll (rfu)',
      ysichlugl: 'Chlorophyll (ugl)',
      ysiturbntu: 'Turbidity (ntu)',
      Turb: 'Turbidity (ntu)',
      CHLrfu: 'Chlorophyll (rfu)',
      WTempC: 'Water Temp (C)',
      BGAPCrfu: 'Blue Green Algae (rfu)',
      SpConduS: 'Specific Conductivity (uS)',
    };

    // let thisStation = this.props.location.pathname.split('/')[1];
    let thisStation = this.props.match.params.id;
    thisStation = 'IAGLR';  // Hard coded for the demo

    const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
    const connection = new WebSocket(url);

    connection.onopen = () => {
      console.log('Stream opened');
    }
    connection.onmessage = e => {
      let self = this;
      let jsonStream = JSON.parse(e.data);

      // Check the stream for the correct station
      let station = jsonStream.station;
      if (station !== thisStation) {
        return null;
      }


      // Check the stream for repeated record
      let timestamp = jsonStream.timestamp;
      let timestamps = [];
      this.state.stream.map((obj, idx) => {return timestamps.push(obj.timestamp)});
      if (timestamp in timestamps) {
        return null;
      }

      let stream = [jsonStream].concat(this.state.stream);
      if (stream.length >= 5) {
        stream = stream.slice(0, 5);
      }

      let turbData = jsonStream.Turb;
      let alert = false;
      let alertMessage = '';
      if (turbData > 10) {
        alert = true;
        alertMessage = 'This station is currently detecting turbidity values that could indicate the presence of a HAB.';
      }

      // Format data for react-bootstrap-table2
      let tableColumns = [{
        dataField: 'parameter',
        text: 'Parameter',
        sort: true,
        hidden: true
      },
      {
        dataField: 'prettyName',
        text: 'Parameter',
        sort: true,
      }];
      stream.map((obj, idx) => {
        return tableColumns.push({
          dataField: obj.timestamp.toString(),
          text: moment.unix(obj.timestamp).format("ddd MMM DD YYYY HH:mm:ss"),
        });
      });
      let tableData = [];
      let paramRows = Object.keys(stream[0]);
      let rowObj = {};
      paramRows = paramRows.filter(item => item !== 'timestamp' && item !== 'station' && item !== 'topic');
      paramRows.map((param, idx) => {
        rowObj = {
          prettyName: param in self.parameterMapping ? self.parameterMapping[param] : param,
          parameter: param
        };
        stream.map((obj, ind) => {
          return rowObj[obj.timestamp] = obj[param];
        });
        return tableData.push(rowObj);
      });
      this.setState({
        tableColumns: tableColumns,
        tableData: tableData,
        stream: [JSON.parse(e.data)].concat(this.state.stream),
        alert: alert,
        alertMessage: alertMessage,
      });
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
        <FontAwesomeIcon icon='spinner' size='4x' spin />
      </div>
    );
  }
  _renderAlert() {
    const {alert, alertMessage} = this.state;
    if (!alert) {
      return null;
    }
    return (
      <div>
        <Alert variant="warning">
          <Alert.Heading>Warning!</Alert.Heading>
          <p>
            {alertMessage}
          </p>
        </Alert>
      </div>
    )
  }

  _renderGaugePlot() {
    const {stream} = this.state;
    let thisStation = this.props.match.params.id;
    if (stream.length === 0) {
      return null;
    }
    return (
      <div>
        <Container>
          <Row>
            <Col sm={4}><StationMap station={thisStation}/></Col>
            <Col sm={4}><GaugePlot stream={stream} parameter='BGAPCrfu' parameterMapping={this.parameterMapping}/></Col>
            <Col sm={4}><GaugePlot stream={stream} parameter='Turb' parameterMapping={this.parameterMapping}/></Col>
          </Row>
        </Container>
      </div>
    );
  }

  _renderTimeSeriesPlot() {
    const {stream, selected} = this.state;
    if (stream.length === 0) {
      return null;
    }
    const colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"];
    return (
      <div>
        {selected.map((param, idx) => {
          return <TimeSeriesPlot stream={stream} parameters={[param]} parameterMapping={this.parameterMapping} color={colors[idx % colors.length]}/>
        })}
      </div>
    );
  }

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState(() => ({
        selected: [...this.state.selected, row.parameter]
      }));
    } else {
      this.setState(() => ({
        selected: this.state.selected.filter(x => x !== row.parameter)
      }));
    }
  }

  handleOnSelectAll = (isSelect, rows) => {
    const params = rows.map(r => r.parameter);
    if (isSelect) {
      this.setState(() => ({
        selected: params
      }));
    } else {
      this.setState(() => ({
        selected: []
      }));
    }
  }

  _renderTable() {
    const selectRow = {
      mode: 'checkbox',
      clickToSelect: true,
      selected: this.state.selected,
      onSelect: this.handleOnSelect,
      onSelectAll: this.handleOnSelectAll,
    };
    return (
      <div className="container" style={{ marginTop: 50 }}>
        <BootstrapTable
          striped
          hover
          keyField='parameter'
          data={ this.state.tableData }
          columns={ this.state.tableColumns }
          selectRow={ selectRow }
        />
      </div>
    );
  }

  renderDashboard() {
    const {stream} = this.state;
    if (stream.length === 0) {
      return (
        this.renderLander()
      )
    }
    let stationName = this.state.stream[0].station;
    return (
      <div className="home-container">
        {this._renderAlert()}
        <h1 align='center'>Station {stationName}</h1>
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
    return <div className="Home">{this.renderDashboard()}</div>;
  }
}
