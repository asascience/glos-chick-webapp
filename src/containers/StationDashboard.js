import React, { Component } from 'react'
import moment from 'moment'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import GaugePlot from '../components/GaugePlot'
import InfoPopover from '../components/InfoPopover'
import { TimeSeriesPlot, TimeSeriesHabsPlot} from '../components/TimeSeriesPlot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GLMap from '../components/Map'
import Cards from '../components/Cards'
import MovingStats from '../components/MovingStats'
import './StationDashboard.css';
import '../components/Cards.scss';
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
      loadingHabs: false,
      stream: [],
      station: '',
      tableColumns: [],
      tableData: [],
      selected: [FEATURED_PARAM],
      alert: false,
      alertMessage: '',
      depth: 'surface'
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
  }

  _fetchHabs() {
    requestJson(HABS_DATA_URL, (error, response) => {
      if (!error) {
        this.setState({
          loadingHabs: false,
          habsData: response,
          selected: ['Dissolved_Microcystin_ugL_1']
        });
      }
    });
    this.setState({
      loadingHabs: true
    })
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
    paramRows = paramRows.filter(item => !this.blacklistParams.includes(item));
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

  _renderMap() {
    let thisStation = this.props.match.params.id;
    console.log(thisStation)
    return (
      <div className='dashboard-map-container'><GLMap station={thisStation} showForecast={false}/></div>
    )
  }

  _renderGauge(habsData) {
    const {stream, data} = this.state;
    let thisStation = this.props.match.params.id;
    if ( (stream.length === 0 || !data) && !habsData) {
      return null;
    }

    let params;
    if (habsData) {
      params = ['Particulate_Microcystin_ugL_1', 'Turbidity_NTU', 'Turbidity_NTU'];
    } else {
      params = ['BGAPCrfu', 'ysiturbntu', 'BGAPCrfu'];
    }

    // Goodbye nearest station table :-( Sneha doesn't like you
    // <Row className="justify-content-md-center">
      // <Col sm={6}>{this._renderNearbyStationTable(data)}</Col>
    // </Row>
    return (
      <div>
        <Row>
          {params.map((param, idx) => {
            let dataPoint, timestamp;
            if (habsData) {
              let vals = habsData.properties.data[param].values;
              dataPoint = vals[vals.length - 1];
              if (Array.isArray(dataPoint)) {
                let ind = this.state.depth === 'surface' ? 0 : 1;
                dataPoint = dataPoint[ind]
              }
            } else {
              let timeParam = 'timestamp' in stream[0] ? 'timestamp' : 'date';
              dataPoint = stream[0][param];
            }
            return <Col xs={12} lg={4}><GaugePlot dataPoint={dataPoint} parameter={this.parameterMapping[param]}/></Col>
          })}
        </Row>
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

  _renderHabsTimeSeriesPlot(data) {
    const {selected} = this.state;
    const colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"];
    return (
      <div>
        {selected.map((param, idx) => {
          return param in this.parameterMapping ? <TimeSeriesHabsPlot key={param} data={data.properties.data[param]} depth={this.state.depth} parameters={[param]} parameterMapping={this.parameterMapping} color={colors[idx % colors.length]}/> : null
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

    const customTotal = (fro, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { fro } to { to } of { size } Results
      </span>
    );

    const options = {
      paginationSize: 4,
      pageStartIndex: 0,
      showTotal: true,
      paginationTotalRenderer: customTotal,
      sizePerPageList: [{
        text: '3', value: 3
      }, {
        text: '5', value: 5
      }, {
        text: 'All', value: tableData.length
      }] // A numeric array is also available. the purpose of above example is custom the text
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
          pagination={ paginationFactory(options) }
        />
      </div>
    );
  }
  handleClick(selected){
    this.setState({
      selected: selected
    });
  }

  handleDepthClick(event) {
    let depth = event.target.attributes.getNamedItem('data-key').value;
    if (depth != this.state.depth) {
      this.setState({depth: depth});
    }
  }

  _renderCards(data) {
    const {stream, habsData} = this.state;
    let params = [];
    if (data) {
      Object.keys(data.properties.data).filter(item => item in this.parameterMapping).map((key, idx) => {
        let values = data.properties.data[key].values;
        let lastValue = values[values.length - 1];
        let description;
        if (lastValue === null) {
          description = 'N/A';
        } else if (lastValue === 'bdl') {
          description = 'Below Detection Limit';
        } else {
          if (Array.isArray(lastValue)) {
            let ind = this.state.depth === 'surface' ? 0 : 1;
            lastValue = lastValue[ind];
          }
          description = parseFloat(lastValue).toFixed(2) + ' ' + data.properties.data[key].units;
        }
        return params.push({
          title: key in this.parameterMapping ? this.parameterMapping[key] : key,
          description: description,
          id: key
        });
      });
    } else {
      Object.keys(stream[0]).filter(item => !this.blacklistParams.includes(item)).map((key, idx) => {
        return params.push({
          title: key in this.parameterMapping ? this.parameterMapping[key] : key,
          description: stream[0][key],
          id: key
        });
      });
    }

    params = params.filter(item => !this.blacklistParams.includes(item));
    let selectedParams = params.map((param, idx) => {
      return this.state.selected.indexOf(param.id) > -1 ? idx : null;
    }).filter(x => x !== null);

    return (
      <Cards
        title=""
        selected={selectedParams}
        cardContents={params}
        maxSelectable={999}
        onChange={this.handleClick.bind(this)}
      />
    )
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
    let lastUpdate = moment.unix(this.state.stream[0]['timestamp']).format("ddd MMM DD YYYY hh:mm a");

    return (
      <div className="home-container">
        {this._renderAlert()}
        <h2 align='left'>Station - {stationName}</h2>
        <h5 align='left'>Last Updated - {lastUpdate}</h5>
        <Row>
          <Col sm={6}>
            <div>
              {this._renderGauge()}
            </div>
          </Col>
          <Col sm={6}>
            <div>
              {this._renderMap()}
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <div id="cards">
              {this._renderCards()}
            </div>
            <div id="plot" style={{marginBottom: '100px'}}>
              {this._renderTimeSeriesPlot()}
            </div>
            <div id="table">
              {this._renderTable()}
            </div>
          </Col>

        </Row>
      </div>
    )
  }

  renderHabsDashboard() {
    const {habsData, loadingHabs} = this.state;
    if (!habsData  && !loadingHabs){
      this._fetchHabs();
    }
    if (!habsData) {
      return (
        this.renderLander()
      )
    }
    let thisStation = this.props.match.params.id;
    let data = habsData.features.filter(item => {
      return thisStation === item.properties.metadata.id;
    });

    if (data.length === 0) {
      return (
        <div className="home-container">
          <h5>Station Data not found</h5>
        </div>
      );
    }
    data = data[0];
    let stationName = thisStation;
    let times = data.properties.data.Arrival_Time.times;
    let lastUpdate = moment(times[times.length - 1]).format('ddd MMM DD YYYY');

    return (
      <div className="home-container">
        {this._renderAlert()}
        <h2 align='left'>Station - {stationName}
          <InfoPopover content={data.properties.metadata.summary} />
        </h2>
        <h5 align='left'>Last Updated - {lastUpdate} </h5>
        <Row>
          <Col lg={6}>
            {this._renderGauge(data)}
          </Col>
          <Col lg={6}>
            <div>
              {this._renderMap()}
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <ButtonGroup onClick={this.handleDepthClick.bind(this)}>
              <Button data-key='surface' variant='warning' active={this.state.depth === 'surface'}>Surface
              </Button>
              <Button data-key='bottom' variant='warning' active={this.state.depth === 'bottom'}>Bottom
              </Button>
            </ButtonGroup>
            <div id="cards">
              {this._renderCards(data)}
            </div>
            <div id="plot" style={{marginBottom: '100px'}}>
              {this._renderHabsTimeSeriesPlot(data)}
            </div>
          </Col>

        </Row>
      </div>
    )
  }

  render() {
    let habsStations = ['WE2', 'WE4', 'WE6', 'WE8', 'WE9', 'WE12', 'WE13', 'WE16'];
    let thisStation = this.props.match.params.id;
    if (habsStations.indexOf(thisStation) > -1) {
      return <div className="Home">{this.renderHabsDashboard()}</div>;
    }
    return <div className="Home">{this.renderDashboard()}</div>;
  }
}
