import React, { Component } from 'react'
import moment from 'moment'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator';
import Badge from 'react-bootstrap/Badge'
import Table from 'react-bootstrap/Table'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import GaugePlot from '../components/GaugePlot'
import { TimeSeriesPlot, TimeSeriesHabsPlot} from '../components/TimeSeriesPlot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GLMap from '../components/Map'
import Cards from '../components/Cards'
import MovingStats from '../components/MovingStats'
import './StationDashboard.css';
import './Alerts.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import {json as requestJson} from 'd3-request';
import { point, distance } from '@turf/turf';

const DATA_URL = 'https://cors-anywhere.herokuapp.com/https://glbuoys.glos.us/static/Buoy_tool/data/meta_english.json?';
const HABS_DATA_URL = 'https://4431mqp2sj.execute-api.us-east-2.amazonaws.com/prod/grabsample';

const FEATURED_PARAM = 'BGAPCrfu';


export default class StationDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: null,
      habsData: null,
      stream: [],
      station: 'tolcrib',
      tableColumns: [],
      tableData: [],
      selected: [FEATURED_PARAM],
      alert: false,
      alertMessage: ''
    };

    this.blacklistParams = ['timestamp', 'date', 'station', 'topic'];

    this.parameterMapping = {
      cond: 'Conductivity',
      do: 'Dissolved Oxygen',
      odo: 'Dissolved Oxygen',
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
      Temp_C: 'Sample Temp',
      Turbidity_NTU: 'Turbidity',
      Extracted_CHLa_ugL_1: 'Extracted Chlorophyll a',
      Extracted_PC_ugL_1: 'Extracted Phycocyanin',
      Particulate_Microcystin_ugL_1: 'Particulate Microcystin',
      Dissolved_Microcystin_ugL_1: 'Dissolved Microcystin',
      Wind_speed_knots: 'Wind Speed',
      Secchi_Depth_m: 'Secchi Depth',
      DO_mgL_1: 'Dissolved Oxygen',
    };

    this._fetchStream();
  }

  _fetchHabs() {
    requestJson(HABS_DATA_URL, (error, response) => {
      if (!error) {
        this.setState({
          habsData: response,
          selected: ['Dissolved_Microcystin_ugL_1']
        });
      }
    });
  }

  _fetchStream() {
    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        this.setState({data: response});
      }
    });

    const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
    const connection = new WebSocket(url);
    const movingStats = new MovingStats();

    connection.onerror = e => {
      console.error('Stream Connection Error');
      return (
        <div>
          <Alert variant="danger">
            <Alert.Heading>Error!</Alert.Heading>
            <p>
              Error connecting to Stream
            </p>
          </Alert>
        </div>
      )
    }

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

      let thisStation = this.state.station;
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

  _renderMap() {
    const {station} = this.state;
    return (
        <Col sm={12}><div className='dashboard-map-container'><GLMap station={station}/></div></Col>
      )
  }

  _renderPlots(habsData) {
    const {stream, data, station} = this.state;
    if ( (stream.length === 0 || !data) && !habsData) {
      return null;
    }

    // Replace with selected
    let params = ['BGAPCrfu', 'ysiturbntu', 'BGAPCrfu'];
    const colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"];
    return (
      <div>
        {params.map((param, idx) => {
          let dataPoint, timestamp;
          if (habsData) {
            let vals = habsData.properties.data[param].values;
            dataPoint = vals[vals.length - 1];
          } else {
            let timeParam = 'timestamp' in stream[0] ? 'timestamp' : 'date';
            dataPoint = stream[0][param];
          }
          return (
            <Row>
              <Col sm={3}><GaugePlot dataPoint={dataPoint} parameter={this.parameterMapping[param]}/></Col>
              <Col sm={9}><TimeSeriesPlot key={param} stream={stream} parameters={[param]} parameterMapping={this.parameterMapping} color={colors[idx % colors.length]}/></Col>
            </Row>
          )
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

  handleClick(selected){
    this.setState({
      selected: selected
    });
  }

  renderDashboard() {
    const {stream, station} = this.state;
    let thisStation = 'tolcrib';
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
    let lastUpdate = moment.unix(this.state.stream[0]['timestamp']).format("ddd MMM DD YYYY hh:mm a");

    return (
      <div className="home-container">
        {this._renderAlert()}
        <h1 align='center'>Alerts</h1>
        <h2 align='left'>Station - {stationName}</h2>
        <h5 align='left'>Last Updated - {lastUpdate}</h5>
        <Row>
          <Col sm={6} className='text-center'>
            <Button
              variant="warning"
              size="lg"
              type={null}
              className="mr-auto ml-2 ml-sm-3 ml-md-4 ml-md-5 rounded-circle btn-sq btn-xl"
              id="reset">
              <FontAwesomeIcon style={{height: "50px", width: "50px"}} icon='bell' />
              <Badge variant="primary">3</Badge>
            </Button>
          </Col>
          <Col sm={6}>
            <div>
              {this._renderMap()}
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <div id="plot" style={{marginBottom: '100px'}}>
              {this._renderPlots()}
            </div>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return <div className="Home">{this.renderDashboard()}</div>;
  }
}
