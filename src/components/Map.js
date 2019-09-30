import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { StaticMap, InteractiveMap, ReactMapGL} from 'react-map-gl';
import { Table } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import DeckGL, {IconLayer, TextLayer, GeoJsonLayer} from 'deck.gl';
import {json as requestJson} from 'd3-request';
import './Map.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import {fromJS} from 'immutable';


const GL_BUOYS_DATA_URL = 'https://cors-anywhere.herokuapp.com/https://glbuoys.glos.us/static/Buoy_tool/data/meta_english.json?';
const HABS_DATA_URL = 'https://4431mqp2sj.execute-api.us-east-2.amazonaws.com/prod/grabsample';


class StationMap extends Component {
    constructor(props) {
      super(props);
      this.state = {
        x: null,
        y: null,
        isLoading: true,
        hoveredObject: null,
        data: null,  // Buoy data
        habs_data: null,  // Weekly habs data
        station: null,
        stream: [],
        forecastLayerActive: 'currents'
      };
      requestJson(GL_BUOYS_DATA_URL, (error, response) => {
        if (!error) {
          this.setState({data: response});
        }
      });
      requestJson(HABS_DATA_URL, (error, response) => {
        if (!error) {
          this.setState({habs_data: response});
        }
      });
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
      if ('geometry' in hoveredObject) {
        const site = hoveredObject.properties.metadata.id;
        const params = Object.keys(hoveredObject.properties.data);
        const times = hoveredObject.properties.data[params[0]].times;
        const lastUpdate = times[times.length - 1];
        return (
          <div className="marker-tooltip" style={{left: x, top: y}}>
            <div><b>{`${site.replace("WE", "Western Erie ")}`}</b></div>
            <div>NOAA GLERL</div>
            <div>Weekly Monitoring Station</div>
            <div>Last Updated at {lastUpdate}</div>
          </div>
        );
      }
      const name = hoveredObject.longName;
      const params = hoveredObject.obsLongName;
      const values = hoveredObject.obsValues;
      const lastUpdate = hoveredObject.updateTime;
      const owner = hoveredObject.buoyOwners;
      return (
        <div className="marker-tooltip" style={{left: x, top: y}}>
          <div><b>{`${name}`}</b></div>
          <div>{`${owner}`}</div>
          <div>Last Updated at {lastUpdate}</div>
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

    handleForecastLayerClick(event) {
      let layer = event.target.attributes.getNamedItem('data-key').value;
      if (layer != this.state.forecastLayer) {
        this.setState({forecastLayerActive: layer});
      }
    }


    renderMap() {
      const {data, habs_data, stream} = this.state;
      if (!data || !habs_data) {
        return null;
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

      // const ICON_MAPPING = {
      //   marker: {x: 0, y: 0, width: 20, height: 50, mask: true}
      // };
      const ICON_MAPPING = {
        marker: {x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask:true}
      };

      const weeklyMonitoringLayer = new GeoJsonLayer({
        id: 'geojson',
        data: habs_data,
        opacity: 1,
        filled: true,
        stroked: false,
        radiusScale: 1,
        pointRadiusScale: 1,
        pointRadiusMinPixels: 10,
        pointRadiusMaxPixels: 100,
        getLineWidth: 2,
        lineWidthScale: 1,
        getLineColor: [1,1,1],
        getFillColor: [115, 28, 226],
        lineWidthMinPixelslineWidthMinPixels: 0,
        getRadius: 100,
        pickable: true,
        onHover: station => {
          this.setState({
            hoveredObject: station.object,
            x: station.x,
            y: station.y
          });
        },
        onClick: station => {
          const {data} = this.state;
          // Redirect to station dashboard page
          let route = '/' + station.object.properties.metadata.id;
          this.props.history.push({
            pathname: route,
          })
        },
      });

      let weeklyMonitoringLabels = [];
      habs_data.features.map((obj, idx) => {
        return weeklyMonitoringLabels.push({
          lat: obj.geometry.coordinates[1],
          lon: obj.geometry.coordinates[0],
          id: obj.properties.metadata.id
        });
      });
      const weeklyMonitoringLabelLayer = new TextLayer({
        id: 'weekly-text-layer',
        data: weeklyMonitoringLabels,
        pickable: true,
        opacity: 1,
        getPosition: d => [d.lon, d.lat],
        getText: d => {
          return d.id
        },
        getSize: 20,
        getAngle: 0,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'top',
        fontFamily: 'Arial',
      });

      const buoyLayer = new IconLayer({
        id: 'icon-layer',
        data: data,
        pickable: true,
        // iconAtlas: 'https://a.tiles.mapbox.com/v3/marker/pin-s+BB9427.png',
        iconAtlas: '/icon-atlas.png',
        iconMapping: ICON_MAPPING,
        // sizeScale: 15,
        sizeScale: 8,
        opacity: 1,
        getIcon: d => 'marker',
        getPosition: d => [d.lon, d.lat],
        getSize: d => 5,
        getColor: d => {
          if ('station' in this.props && d.id === this.props.station) {
            return [0,0,0];
          }
          return [55,126,184];
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

      const buoyLabelLayer = new TextLayer({
        id: 'text-layer',
        data: data,
        pickable: true,
        opacity: 1,
        getPosition: d => [d.lon, d.lat],
        getText: d => {
          return d.id
        },
        getSize: 20,
        getAngle: 0,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center',
        fontFamily: 'Arial',
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
          "habs_currents": {
            "type": "image",
            "url": "https://cors-anywhere.herokuapp.com/https://rps-glos.s3.amazonaws.com/habs_images/2019092417_quivers.png",
            "coordinates": [
              [-83.49609374999999, 42.940339233631825],
              [-78.75000000000001, 42.940339233631825],
              [-78.75000000000001, 41.37680856570234],
              [-83.49609374999999, 41.37680856570234],
            ]
          },
          "habs_winds": {
            "type": "image",
            "url": "https://cors-anywhere.herokuapp.com/https://rps-glos.s3.amazonaws.com/habs_images/2019092417_quivers.png",
            "coordinates": [
              [-83.49609374999999, 42.940339233631825],
              [-78.75000000000001, 42.940339233631825],
              [-78.75000000000001, 41.37680856570234],
              [-83.49609374999999, 41.37680856570234],
            ]
          },
          "video": {
            "type": "video",
            "urls": ["https://cors-anywhere.herokuapp.com/https://user-images.githubusercontent.com/5702672/64719900-3cfeea00-d497-11e9-95d0-0b53909d8724.gif"],
            "coordinates": [
              [-83.49609374999999, 42.940339233631825],
              [-78.75000000000001, 42.940339233631825],
              [-78.75000000000001, 41.37680856570234],
              [-83.49609374999999, 41.37680856570234],
            ]
          }
        },
        "layers": [
          {
            "id": "stamen-terrain",
            "source": "stamen-terrain-raster",
            "type": "raster",
            'layout': {
              'visibility': 'visible'
            },
          },
          {
            'id': 'habs_currents',
            'type': 'raster',
            'source': 'habs_currents',
            'layout': {
              'visibility': this.props.showForecast && this.state.forecastLayerActive === 'currents' ? 'visible' : 'none'
            },
          },
          {
            'id': 'habs_winds',
            'type': 'raster',
            'source': 'habs',
            'layout': {
              'visibility': this.props.showForecast && this.state.forecastLayerActive === 'winds' ? 'visible' : 'none'
            },
          },
        ]
      };

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

      let token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

      // let layers = this.props.showForecast ? [] : [buoyLayer, buoyLabelLayer, weeklyMonitoringLayer, weeklyMonitoringLabelLayer];
      let layers = [buoyLayer, buoyLabelLayer, weeklyMonitoringLayer, weeklyMonitoringLabelLayer];
      return (
        <div className="map-container">
          {this._renderTooltip()}

          <DeckGL initialViewState={viewstate} controller={true} layers={layers}>
            <InteractiveMap mapStyle={mapStyle} mapboxApiAccessToken={token}/>
          </DeckGL>
          <div>
          {this.props.showForecast && (
            <ButtonGroup onClick={this.handleForecastLayerClick.bind(this)}>
              <Button data-key='currents' variant="warning">Currents</Button>
              <Button data-key='winds' variant="warning">Winds</Button>
              <Button data-key='off' variant="warning">Off</Button>
            </ButtonGroup>
          )}
          {this.props.showForecast && this._renderLegend()}
          </div>
        </div>
      );
    }

    render() {
      return this.renderMap();
    }
}

export default withRouter(StationMap);
