import React, { Component } from 'react'
import moment from 'moment'
import BootstrapTable from 'react-bootstrap-table-next'
import Table from 'react-bootstrap/Table'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import GaugePlot from '../components/GaugePlot'
import { TimeSeriesPlot } from '../components/TimeSeriesPlot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import StationMap from '../components/Map'
import MovingStats from '../components/MovingStats'
import './StationDashboard.css';
import {json as requestJson} from 'd3-request';
import { point, distance } from '@turf/turf';

const DATA_URL = 'https://cors-anywhere.herokuapp.com/https://glbuoys.glos.us/static/Buoy_tool/data/meta_english.json?';
const FEATURED_PARAM = 'BGAPCrfu';


export default class StationDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: null,
      stream: [],
      station: '',
      tableColumns: [],
      tableData: [],
      selected: [FEATURED_PARAM],
      alert: false,
      alertMessage: ''
    };

    this.parameterMapping = {
      cond: 'Conductivity',
      do: 'Dissolved Oxygen Concentration',
      odo: 'Dissolved Oxygen Concentration',
      dosat: 'Dissolved Oxygen Saturation',
      odosat: 'Dissolved Oxygen Saturation',
      fdomQSU: 'FDOM',
      fdomRFU: 'FDOM (RFU)',
      ph: 'pH',
      pH: 'pH',
      spcond: 'Specific Conductivity',
      wtmp1: 'Water Temp',
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
      TurbidityNTU: 'Turbidity (ntu)',
    };
  }

  _fetchStream() {
    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        this.setState({data: response});
      }
    });

    // thisStation = 'HabsGrab';  // Hard coded for the demo

    const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
    const connection = new WebSocket(url);

    const movingStats = new MovingStats();

    connection.onopen = e => {
      console.log('Stream opened');
      const message = JSON.stringify({action: 'history'});
      connection.send(message);
    }
    connection.onmessage = e => {
      let self = this;
      let jsonStreams = JSON.parse(e.data);

      if (!Array.isArray(jsonStreams)) {
        return;
      }

      let thisStation = this.props.match.params.id;
      let filteredStream = jsonStreams.filter(function(item){
        return item.station === thisStation;
      });

      if (filteredStream.length === 0) return null;
      // Check the stream for the correct station
      let station = filteredStream[0].station;
      if (station !== thisStation) {
        return null;
      }

      let stream = filteredStream.concat(this.state.stream);

      // Define function to sort array of objects
      const sortByKey = (array, key) => {
        return array.sort(function(a, b) {
          let x = a[key];
          let y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }
      stream = sortByKey(stream, 'timestamp').reverse();

      this.setState({
        stream: stream,
        station: station
      });
    }
  }

  _sortStationsByDistance(data) {
    // Start by getting the active station lat/lon
    let thisStation = this.props.match.params.id;
    let stationLat = null;
    let stationLon = null;
    let lake = null;
    data.forEach(function(station) {
      if (station.id === thisStation) {
        stationLat = station.lat;
        stationLon = station.lon;
        lake = station.lake;
      }
    });

    if (!stationLat) {
      return null;
    }

    let fro = point([stationLon, stationLat]);
    var options = {units: 'miles'};
    // Now calculate the distance from all the other stations in nautical miles
    data.forEach(function(station) {
        if (station.lon && station.lat && station.obsLongName) {
          let to = point([station.lon, station.lat]);
          // let value = station.lake === lake ? distance(fro, to, options) : 9999.99;
          let value = distance(fro, to, options);
          Object.defineProperty(station, 'distance', {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
    });
    // Now sort by distance
    data.sort(function(a, b) {
      if (a.distance > b.distance) return 1;
      if (a.distance < b.distance) return -1;
      // a must be equal to b
      return 0;
    });
    // Grab the top 5 closest stations
    let nearestStations = data.slice(1, 6);
    return nearestStations;
  }

  _buildTable() {
    let self = this;
    // Format data for react-bootstrap-table2
    const formatWithIcon = (cell, row, rowIndex, formatExtraData) => {
      let icon = 'arrow-circle-up';
      if (cell === 'down') {
        icon = 'arrow-circle-down';
      }
      return(
        <span><FontAwesomeIcon icon={icon} style={{'marginRight': '7px'}}/></span>
      )
    }

    let tableColumns = [
      {
        dataField: 'parameter',
        text: 'Parameter',
        sort: true,
        hidden: true
      },
      {
        dataField: 'prettyName',
        text: 'Parameter',
        sort: true,
      },
      // {
      //   dataField: 'trend',
      //   text: 'Trend',
      //   sort: true,
      //   formatter: formatWithIcon,
      //   formatExtraData: formatWithIcon,
      // }
    ];
    let alert = false;
    let alertMessage = '';
    let stream = Array.from(this.state.stream);;

    if (stream.length >= 5) {
      stream = stream.slice(0, 5);
    }

    var timestamp = 'timestamp';
    if (!(timestamp in stream[0])) {
      timestamp = 'date';
      stream[0][timestamp] = Math.round(stream[0][timestamp]);
      // jsonStream[timestamp] = Math.round(jsonStream[timestamp]/1000);
    }

    // Check the stream for the correct station
    // let station = jsonStream.station;
    // if (station !== thisStation) {
    //   return null;
    // }


    // Check the stream for repeated record
    // let ts = jsonStream[timestamp];
    // let timestamps = [];
    // this.state.stream.map((obj, idx) => {return timestamps.push(obj[timestamp])});
    // if (ts in timestamps) {
    //   return null;
    // }

    let featuredData = stream[0][FEATURED_PARAM];

    if (featuredData > 2) {
      alert = true;
      alertMessage = 'This station is currently detecting Blue Green Algae values that could indicate the presence of a HAB.';
    }

    stream.map((obj, idx) => {
      return tableColumns.push({
        dataField: obj[timestamp].toString(),
        text: moment.unix(obj[timestamp]).format("ddd MMM DD YYYY HH:mm:ss"),
      });
    });

    let tableData = [];
    let paramRows = Object.keys(stream[0]);
    let rowObj = {};
    paramRows = paramRows.filter(item => item !== 'timestamp' && item !== 'date' && item !== 'station' && item !== 'topic');
    paramRows.map((param, idx) => {
      rowObj = {
        prettyName: param in self.parameterMapping ? self.parameterMapping[param] : param,
        parameter: param
      };
      stream.map((obj, ind) => {
        let val = obj[param];  // Take this multiplier out!
        return rowObj[obj[timestamp]] = val.toFixed(2);
      });
      return tableData.push(rowObj);
    });

    return {
      tableColumns: tableColumns,
      tableData: tableData,
    };
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
      <div className="station-lander">
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

  _renderNearbyStationTable(data) {
    // const {data} = this.state;
    if (!data) {
      return (
        <FontAwesomeIcon icon='spinner' size='4x' spin />
      );
    }
    let nearbyStations = this._sortStationsByDistance(data);
    if (!nearbyStations) {
      return (
        <FontAwesomeIcon icon='spinner' size='4x' spin />
      );
    }
    let tableColumns = [
      {
        dataField: 'station',
        text: 'Station',
        sort: false,
      },
      {
        dataField: 'distance',
        text: 'Distance (nm)',
        sort: false,
      },
      {
        dataField: 'parameter',
        text: this.parameterMapping[FEATURED_PARAM],
        sort: false,
      }
    ];
    let tableData = [];
    nearbyStations.map((station, idx) => {
      let ind = station.obsLongName.indexOf('Blue-Green Algae');
      let val = ind < 0 ? 'N/A' : station.obsValues[ind];
      let rowObj = {
        station: station.id,
        distance: station.distance.toFixed(2),
        parameter: val
      };
      return tableData.push(rowObj);
    });

    const rowEvents = {
      onClick: (e, row, rowIndex) => {
      }
    };
    return (
      <div className="dashboard-nearby-station-table">
        <h5>Nearby Stations</h5>
        <BootstrapTable
          striped
          hover
          condensed
          keyField='parameter'
          data={ tableData }
          columns={ tableColumns }
        />
      </div>
    )
  }

  _renderMapAndGauge() {
    const {stream, data} = this.state;
    let thisStation = this.props.match.params.id;
    if (stream.length === 0 || !data) {
      return null;
    }

    // Add station to data
    // let ids = data.map(a => a.id);
    // if (ids.includes("HabsGrab")) {
    //   for (let i in data) {
    //      if (data[i].id === 'HabsGrab') {
    //         console.log('HABS GRAB')
    //         // data[i].lat = Math.random() + 41;
    //         // data[i].lon = Math.random() + -71;
    //         data[i].lat = stream[0].lat + Math.random() * 15;
    //         data[i].lon = stream[0].lon + Math.random() * 15;
    //         console.log(data[i].lat)
    //         console.log(data[i].lon)
    //         break; //Stop this loop, we found it!
    //      }
    //    }
    // } else {
      let newData = JSON.parse(JSON.stringify(data));
      let obsLongName = Object.keys(stream[0]);
      obsLongName = obsLongName.filter(item => item !== 'timestamp' && item !== 'date' && item !== 'station' && item !== 'topic');
      let obsValues = [];
      let obsUnits = [];
      obsLongName.forEach(function (item, index) {
        obsValues.push(stream[0][item]);
        obsUnits.push('');
      });
      newData.push({
          "lon": stream[0].lon,
          "recovered": false,
          "lat": stream[0].lat,
          "timeZone": "America/New_York",
          "buoyInfo": "This buoy is for demo purposes only",
          "buoyAlert": "",
          "id": "HabsGrab",
          "lake": "ER",
          "longName": "Habs Grab",
          "obsID": [],
          "obsUnits": obsUnits,
          "obsLongName": obsLongName,
          "updateTime": "2019-05-28T16:30:00Z",
          "obsValues": obsValues
      });
    // }

    return (
      <div>
        <Container>
          <Row>
            <Col sm={5}><div className='dashboard-map-container'><StationMap station={thisStation} data={newData}/></div></Col>
            <Col sm={4}>{this._renderNearbyStationTable(newData)}</Col>
            <Col sm={3}><GaugePlot stream={stream} parameter={FEATURED_PARAM} parameterMapping={this.parameterMapping}/></Col>
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
          return <TimeSeriesPlot key={param} stream={stream} parameters={[param]} parameterMapping={this.parameterMapping} color={colors[idx % colors.length]}/>
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
    const {tableData, tableColumns} = this._buildTable();

    if (tableData.length === 0) {
      return null;
    }
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
          data={ tableData }
          columns={ tableColumns }
          selectRow={ selectRow }
        />
      </div>
    );
  }

  renderDashboard() {
    const {stream, station} = this.state;
    let thisStation = this.props.match.params.id;
    if (station !== thisStation) {
      this._fetchStream();
      this.setState({
        stream: [],
        station: thisStation
      });
    }
    if (stream.length === 0) {
      return (
        this.renderLander()
      )
    }
    let stationName = this.state.station;
    return (
      <div className="home-container">
        {this._renderAlert()}
        <h1 align='center'>Station {stationName}</h1>
        <div id="plot">
          {this._renderMapAndGauge()}
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