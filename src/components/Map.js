import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { StaticMap, InteractiveMap, ReactMapGL} from 'react-map-gl';
import { Table } from 'react-bootstrap';
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
        const site = hoveredObject.properties.metadata.Site;
        const params = Object.keys(hoveredObject.properties.data);
        const times = hoveredObject.properties.data[params[0]].times;
        const lastUpdate = times[times.length - 1];
        return (
          <div className="marker-tooltip" style={{left: x, top: y}}>
            <div><b>{`${site.replace("WE", "Western Erie ")}`}</b></div>
            <div><b>NOAA GLERL</b></div>
            <div><b>Last Updated at {lastUpdate}</b></div>
          </div>
        );
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

      const ICON_MAPPING = {
        marker: {x: 0, y: 0, width: 20, height: 50, mask: true}
      };
      const weeklyMonitoringLayer = new GeoJsonLayer({
        id: 'geojson',
        data: habs_data,
        opacity: 1,
        filled: true,
        stroked: true,
        radiusScale: 1,
        pointRadiusScale: 1,
        pointRadiusMinPixels: 10,
        getLineWidth: 60,
        getLineColor: [55,126,184],
        getFillColor: [46, 139, 87],
        getRadius: 100,
        getLineWidth: 2,
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
          let route = '/' + station.object.properties.metadata.Site;
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
          id: obj.properties.metadata.Site
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
        iconMapping: ICON_MAPPING,
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
          "eds": {
            "type": "raster",
            "tiles": [
              'http://coastmap.com/ecop/wms.aspx?service=WMS&request=GetMap&version=1.1.1&layers=WW3_WAVE_HEIGHT&styles=WAVE_HEIGHT_STYLE-Jet-0-8&format=image%2Fpng&transparent=true&time=2019-09-05T12%3A00%3A00Z&exceptions=application%2Fvnd.ogc.se_xml&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'
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
          "habs_image": {
            "type": "image",
            // "url": "https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif",
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
            'id': 'habs_image',
            'type': 'raster',
            'source': 'habs_image',
            'layout': {
              'visibility': 'none'
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
      return (
        <div className="map-container">
          {this._renderTooltip()}
          <DeckGL initialViewState={viewstate} controller={true} layers={[buoyLayer, buoyLabelLayer, weeklyMonitoringLayer, weeklyMonitoringLabelLayer]}>
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
