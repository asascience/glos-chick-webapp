import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { StaticMap, InteractiveMap} from 'react-map-gl';
import { Table } from 'react-bootstrap';
import DeckGL, {IconLayer, HexagonLayer, TextLayer} from 'deck.gl';
import {json as requestJson} from 'd3-request';
import './Map.css';
import 'mapbox-gl/dist/mapbox-gl.css';


const DATA_URL = 'https://cors-anywhere.herokuapp.com/https://glbuoys.glos.us/static/Buoy_tool/data/meta_english.json?';

class StationMap extends Component {
    constructor(props) {
      super(props);
      this.state = {
        x: null,
        y: null,
        isLoading: true,
        hoveredObject: null,
        data: null,
        station: null,
        stream: [],
      };
      requestJson(DATA_URL, (error, response) => {
        if (!error) {
          this.setState({data: response});
        }
      });

      let thisStation = 'HabsGrab';  // Hard coded for the demo

      const url = 'wss://gdjcxvsub6.execute-api.us-east-2.amazonaws.com/testing';
      const connection = new WebSocket(url);


      connection.onopen = e => {
        console.log('Stream opened');
        const message = JSON.stringify({action: 'history'});
        connection.send(message);
      }
      connection.onmessage = e => {
        let self = this;
        let jsonStreams = JSON.parse(e.data);
        console.log(jsonStreams)

        if (!Array.isArray(jsonStreams)) {
          return;
        }

        if (jsonStreams.length === 0) return null;
        // Check the stream for the correct station
        let station = jsonStreams[0].station;
        if (station !== thisStation) {
          return null;
        }

        let stream = jsonStreams.concat(this.state.stream);
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

    _renderTooltip() {
      const {x, y, hoveredObject} = this.state;
      if (!hoveredObject) {
          return null;
      }
      const lat = hoveredObject.lat;
      const lng = hoveredObject.lon;
      const name = hoveredObject.longName;
      const params = hoveredObject.obsLongName;
      const values = hoveredObject.obsValues;
      const units = hoveredObject.obsUnits;
      return (
        <div className="marker-tooltip" style={{left: x, top: y}}>
          <div><b>{`${name}`}</b></div>
          <Table striped bordered hover size="sm">
            <tbody>
              {params && params.map((param, idx) => {
                let val = values[idx] ? values[idx].toFixed(2) : values[idx];
                let valString = val + ' ' + units[idx];
                return (
                  <tr>
                     <td>{`${param}`}</td>
                     <td>{`${valString}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      );
    }

    _renderLegend() {
      return (
        <div className="legend-panel">
          <img src="https://oceansmap.s3.amazonaws.com/assets/legends/habs_tracker_legend.png" alt="Logo" />
        </div>
      );
    }

    renderMap() {
      const {data, stream} = this.state;
      if (!data) {
        return null;
      }
      let newData = null;
      if (stream.length > 0) {
        newData = JSON.parse(JSON.stringify(data));
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
      }

      // Set the Viewport
      let latitude = 42.25;
      let longitude = -82;
      let zoom = 7;
      if ('station' in this.props) {
        let stationObj = data.find(x => x.id === this.props.station);
        if (stationObj) {
          zoom = 8;
          latitude = stationObj.lat;
          longitude = stationObj.lon;
        }
      }

      // Viewport settings
      const viewstate = {
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
        pitch: 0,
        bearing: 0
      };

      const ICON_MAPPING = {
        marker: {x: 0, y: 0, width: 20, height: 50, mask: true}
      };

      const layer = new IconLayer({
        id: 'icon-layer',
        data: 'data' in this.props ? this.props.data : newData || data,
        pickable: true,
        iconAtlas: 'https://a.tiles.mapbox.com/v3/marker/pin-s+BB9427.png',
        iconMapping: ICON_MAPPING,
        sizeScale: 5,
        getIcon: d => 'marker',
        getPosition: d => [d.lon, d.lat],
        getSize: d => 15,
        getColor: d => {
          if ('station' in this.props && d.id === this.props.station) {
            return [0,0,0];
          }
          if (d.id === 'HabsGrab') {
            return [0,128,0];
          }
          return d.recovered ? [220,20,60] : [55,126,184];
        },
        onHover: station => this.setState({
          hoveredObject: station.object,
          x: station.x,
          y: station.y
        }),
        onClick: station => {
          const {data} = this.state;
          // Redirect to station dashboard page
          let route = '/' + station.object.id;
          this.props.history.push({
            pathname: route,
            state: {data: data},
          })
        }
      });

      const labelLayer = new TextLayer({
        id: 'text-layer',
        data: 'data' in this.props ? this.props.data : newData || data,
        pickable: true,
        getPosition: d => [d.lon, d.lat],
        getText: d => {
          return d.id
        },
        getSize: 16,
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'Arial',
        fontWeight: 'bold'
      });

      const mapStyle = {
        "version": 8,
        "name": "Stamen Terrain",
        "sources": {
          "stamen-terrain-raster": {
            "type": "raster",
            "tiles": [
              'http://a.tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
              'http://b.tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
              'http://c.tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
            ],
            "tileSize": 256
          },
          "habs": {
            "type": "raster",
            "tiles": [
              'https://tiles.oceansmap.com/habs/2019-08-07T14:00:00/{z}/{x}/{y}.png'
            ],
            "tileSize": 256
          },
          "wms-glcfs-currents": {
            'type': 'raster',
            'tiles': [
              'http://tds.glos.us/thredds/wms/glos/glcfs/erie/ncfmrc-2d/Lake_Erie_-_Nowcast_2D_best.ncd?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=utm:vtm-dir&STYLES=default-arrows/default'
            ],
            'tileSize': 256
          },
          "overlay": {
            "type": "image",
            // "url": "https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif",
            "url": "https://s3.amazonaws.com/asa-dev/MyGLOS/terra.2019147.0527.1542_1545_1720C.L3.GL1.v930seadasv7521_1_2.CI_merge.tif",
            "coordinates": [
              [-80.425, 46.437],
              [-71.516, 46.437],
              [-71.516, 37.936],
              [-80.425, 37.936]
            ]
          }
        },
        "layers": [
          {
            "id": "stamen-terrain",
            "source": "stamen-terrain-raster",
            "type": "raster"
          },
          {
            "id": "habs",
            "source": "habs",
            "type": "raster"
          }
          // {
          //   'id': 'wms-glcfs-currents',
          //   'type': 'raster',
          //   'source': 'wms-glcfs-currents',
          // },
        ]
      };

      // const OPTIONS = ['radius', 'coverage', 'upperPercentile'];

      const COLOR_RANGE = [
        [1, 152, 189],
        [73, 227, 206],
        [216, 254, 181],
        [254, 237, 177],
        [254, 173, 84],
        [209, 55, 78]
      ];

      const LIGHT_SETTINGS = {
        lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
        ambientRatio: 0.4,
        diffuseRatio: 0.6,
        specularRatio: 0.2,
        lightsStrength: [0.8, 0.0, 0.8, 0.0],
        numberOfLights: 2
      };

      const hexagonLayer = new HexagonLayer({
        id: 'hexagonLayer',
        colorRange: COLOR_RANGE,
        data: 'data' in this.props ? this.props.data : newData || data,
        elevationRange: [0, 1000],
        elevationScale: 400,
        extruded: true,
        getPosition: d => [d.lon, d.lat],
        lightSettings: LIGHT_SETTINGS,
        opacity: 1,
        radius: 8000
        // ...options
      });
      let token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      return (
        <div className="map-container">
          {this._renderTooltip()}
          <DeckGL initialViewState={viewstate} controller={true} layers={[layer, labelLayer]}>
            <InteractiveMap mapStyle={mapStyle} mapboxApiAccessToken={token}/>
            {this._renderLegend()}
          </DeckGL>
        </div>
      );
    }

    render() {
      return this.renderMap();
    }
}

export default withRouter(StationMap);
