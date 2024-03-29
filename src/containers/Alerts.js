import React, { Component } from 'react'
import { Link } from 'react-router-bootstrap';
import moment from 'moment'
import Badge from 'react-bootstrap/Badge'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import GaugePlot from '../components/GaugePlot'
import { TimeSeriesPlot } from '../components/TimeSeriesPlot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GLMap from '../components/Map'
import {json as requestJson} from 'd3-request';
import './StationDashboard.css';
import './Alerts.css';

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
      station: 'tollsps',
      tableColumns: [],
      tableData: [],
      selected: [FEATURED_PARAM],
      alert: false,
      alerts: null,
      alertMessage: '',
      numAlerts: 0
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
      const alertMessage = JSON.stringify({action: 'alerts', phoneNumber: '+15182653837'});
      connection.send(alertMessage);
    }
    connection.onmessage = e => {
      let jsonStreams = JSON.parse(e.data);
      if (!Array.isArray(jsonStreams)) {
        return;
      }

      // Is this the alerts response?
      if ('phoneNumber' in jsonStreams[0]) {
        this._parseAlerts(jsonStreams);
        return null;
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
  /*
    Parses the most recent alert messages

    Expecting a list of objects

    object:
    id: "ae06e100-726d-48e9-a972-3d6c2f40d580"
    lastMessage: 0
    parameter: "pH"
    phoneNumber: "+5555555555"
    station: "tolcrib"
    threshold: 8.5
  */
  _parseAlerts(response) {
    let selected = response.filter((obj, idx) => {
      return obj.lastMessage > 0;
    }).map((obj, idx) => {return obj.parameter});
    let numAlerts = selected.length;

    this.setState({
      numAlerts: numAlerts,
      alerts: response,
      selected: selected
    })
  }

  _onClickExternalLink() {
    let route = '/' + this.state.station;
    this.props.history.push({
      pathname: route
    })
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
    const {stream, data, alerts} = this.state;
    if ( (stream.length === 0 || !data) && !habsData) {
      return null;
    }

    const colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"];
    return (
      <div>
        {this.state.selected.map((param, idx) => {
          let dataPoint;
          if (habsData) {
            let vals = habsData.properties.data[param].values;
            dataPoint = vals[vals.length - 1];
          } else {
            dataPoint = stream[0][param];
          }
          let lastAlert = '';
          if (alerts) {
            let alert = alerts.filter((obj, idx) => {
              return obj.parameter === param;
            });
            lastAlert = 'Last alert triggered ' + moment.unix(alert[0].lastMessage).format("ddd MMM DD YYYY hh:mm a");
          }

          return (
            <Row>
              <Col sm={3} style={{paddingTop: '30px'}}><GaugePlot dataPoint={dataPoint} parameter={this.parameterMapping[param]}/></Col>
              <Col sm={9}><TimeSeriesPlot subtitle={lastAlert} key={param} stream={stream} parameters={[param]} parameterMapping={this.parameterMapping} color={colors[idx % colors.length]}/></Col>
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
    let thisStation = 'tollsps';
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
        <Row>
          <Col sm={6} className='text-center'>
            <h2 align='left'>
              Station - {stationName}
              <FontAwesomeIcon onClick={this._onClickExternalLink.bind(this)} title='Go to Station Page' icon='external-link-alt' style={{'marginLeft': '7px'}} />
            </h2>
            <h5 align='left'>Last Updated - {lastUpdate}</h5>
            <Button
              variant="warning"
              size="lg"
              type={null}
              className="mr-auto ml-2 ml-sm-3 ml-md-4 ml-md-5 rounded-circle btn-sq btn-xl"
              id="reset">
              <FontAwesomeIcon style={{height: "50px", width: "50px"}} icon='bell' />
              <Badge variant="primary">{this.state.numAlerts}</Badge>
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
