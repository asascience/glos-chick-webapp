import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { StaticMap, InteractiveMap, ReactMapGL} from 'react-map-gl';
import { Table } from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DeckGL, {IconLayer, TextLayer, GeoJsonLayer} from 'deck.gl';
import {json as requestJson} from 'd3-request';
import './Map.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import {fromJS} from 'immutable';
import stationMarker from './pin-s+377EB8.png'
// import MAP_STYLE from './map-style.json';

// const defaultMapStyle = fromJS(MAP_STYLE);

const GL_BUOYS_DATA_URL = 'https://cors-anywhere.herokuapp.com/https://glbuoys.glos.us/static/Buoy_tool/data/meta_english.json?';
const HABS_DATA_URL = 'https://4431mqp2sj.execute-api.us-east-2.amazonaws.com/prod/grabsample';


class GLMap extends Component {
    constructor(props) {
      super(props);
      this.state = {
        x: null,
        y: null,
        isLoading: true,
        hoveredObject: null,
        data: null,  // Buoy data
        habsData: null,  // Weekly habs data
        station: null,
        stream: [],
        forecastLayerActive: 'none',
        currentImage: 0,
        animationState: 'play',
        // mapStyle: defaultMapStyle
      };
      this._child = React.createRef();
      // this._defaultLayers = defaultMapStyle.get('layers');
      this.animationLayerIds = ['habs_currents', 'habs_winds'];

      requestJson(GL_BUOYS_DATA_URL, (error, response) => {
        if (!error) {
          this.setState({data: response});
        }
      });
      requestJson(HABS_DATA_URL, (error, response) => {
        if (!error) {
          this.setState({habsData: response});
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

    componentWillUnmount(){
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
        this.setState({
          forecastLayerActive: layer,
        });
      }
      if (layer === 'none') {
      }
    }

    onPlayClick() {
      let source = this.state.forecastLayerActive;
      this._child.current.getMap().getSource(source).getVideo().play();

      this.setState({
        animationState: 'play'
      });
    }

    onPauseClick() {
      let source = this.state.forecastLayerActive;
      self._child.current.getMap().getSource(source).getVideo().pause();

      this.setState({
        animationState: 'pause'
      });
    }

    renderMap() {
      const {data, habsData, stream} = this.state;
      if (!data || !habsData) {
        return null;
      }

      // Set the Viewport
      let latitude = 42.25;
      let longitude = -82;
      let zoom = 7;
      if ('station' in this.props) {
        let stationObj = data.find(x => x.id === this.props.station);
        let weeklyMonitoringObj = habsData.features.find(x => x.properties.metadata.id === this.props.station)
        if (stationObj) {
          zoom = 9;
          latitude = stationObj.lat;
          longitude = stationObj.lon;
        } else if (weeklyMonitoringObj) {
          zoom = 9;
          latitude = weeklyMonitoringObj.geometry.coordinates[1];
          longitude = weeklyMonitoringObj.geometry.coordinates[0];
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
      // const ICON_MAPPING = {
      //   marker: {x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask:true}
      // };

      const weeklyMonitoringLayer = new GeoJsonLayer({
        id: 'station' in this.props ? this.props.station + '_geojson' : 'geojson',
        data: habsData,
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
        getFillColor: d => {
          if ('station' in this.props && d.properties.metadata.id === this.props.station) {
            return [0,0,0];
          }
          return [55,126,184];
        },
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
          // Redirect to station dashboard page
          let route = '/' + station.object.properties.metadata.id;
          this.props.history.push({
            pathname: route
          })
        },
      });

      let weeklyMonitoringLabels = [];
      habsData.features.map((obj, idx) => {
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
        iconAtlas: 'https://a.tiles.mapbox.com/v3/marker/pin-s+BB9427.png',
        // iconAtlas: '/icon-atlas.png',
        iconMapping: ICON_MAPPING,
        // sizeScale: 15,
        sizeScale: 5,
        opacity: 1,
        getIcon: d => 'marker',
        getPosition: d => [d.lon, d.lat],
        getSize: d => 15,
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
          "habs_currents": {
            "type": "video",
            "urls": ["/test.webm"],
            "coordinates": [
              [-83.67187500000001, 43.06888777416961],
              [-78.75000000000001, 43.06888777416961],
              [-78.75000000000001, 41.244772343082076],
              [-83.67187500000001, 41.244772343082076]
            ]
          },
          "habs_winds": {
            "type": "video",
            "urls": ["/test.webm"],
            "coordinates": [
              [-83.67187500000001, 43.06888777416961],
              [-78.75000000000001, 43.06888777416961],
              [-78.75000000000001, 41.244772343082076],
              [-83.67187500000001, 41.244772343082076]
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
        ]
      };

      this.props.showForecast && this.state.forecastLayerActive === 'winds' && mapStyle.layers.push({
        'id': 'habs_winds',
        'type': 'raster',
        'source': 'habs_winds',
        'layout': {
          'visibility': 'visible'
        },
        "paint": {
          "raster-fade-duration": 0
        }
      });

      this.props.showForecast && this.state.forecastLayerActive === 'currents' && mapStyle.layers.push({
        'id': 'habs_currents',
        'type': 'raster',
        'source': 'habs_currents',
        'layout': {
          'visibility': 'visible'
        },
        "paint": {
          "raster-fade-duration": 0
        }
      });

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
          <div className="map">
            {this._renderTooltip()}
            <DeckGL initialViewState={viewstate} controller={true} layers={layers}>
              <InteractiveMap ref={this._child} mapStyle={mapStyle} mapboxApiAccessToken={token}/>
            </DeckGL>
            {this.props.showForecast && (
              <div>
                <ButtonGroup onClick={this.handleForecastLayerClick.bind(this)}>
                  <Button active={this.state.forecastLayerActive === 'habs_currents'} data-key='habs_currents' variant="warning">Currents</Button>
                  <Button active={this.state.forecastLayerActive === 'habs_winds'} data-key='habs_winds' variant="warning">Winds</Button>
                  <Button active={this.state.forecastLayerActive === 'none'} data-key='none' variant="warning">Off</Button>
                </ButtonGroup>
              </div>
            )}
            {this.props.showForecast && this.state.forecastLayerActive !== 'none' && (
              <div>
                <ButtonGroup>
                  <Button active={this.state.animationState === 'play'} variant="warning"><FontAwesomeIcon data-key='play' onClick={this.onPlayClick.bind(this)} icon='play-circle'/></Button>
                  <Button active={this.state.animationState === 'pause'} variant="warning"><FontAwesomeIcon data-key='pause' onClick={this.onPauseClick.bind(this)} icon='pause-circle'/></Button>
                </ButtonGroup>
              </div>
            )}
            <div>
              {this.props.showForecast && this._renderLegend()}

            </div>
          </div>
          <div className="legend-text">
            Click on any station to see info.
            <img src={stationMarker}/>
            Real time in-water stations
            <span class="dot"></span>
            Field Samples
          </div>
        </div>
      );
    }

    render() {
      return this.renderMap();
    }
}

export default withRouter(GLMap);
