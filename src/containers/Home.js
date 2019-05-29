import React, { Component } from 'react';
import { API } from 'aws-amplify';
import {StaticMap} from 'react-map-gl';
import DeckGL, {IconLayer, HexagonLayer} from 'deck.gl';
import {json as requestJson} from 'd3-request';
import './Home.css';
import 'mapbox-gl/dist/mapbox-gl.css';


// Viewport settings
const viewstate = {
  longitude: -84.5,
  latitude: 45,
  zoom: 5,
  pitch: 0,
  bearing: 0
};

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
    "wms-glcfs-currents": {
      'type': 'raster',
      'tiles': [
        'http://tds.glos.us/thredds/wms/glos/glcfs/erie/ncfmrc-2d/Lake_Erie_-_Nowcast_2D_best.ncd?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=utm:vtm-group&&TIME=2019-05-28T12%3A00%3A00.000Z&STYLES=default-vector%2Fseq-Heat-inv'
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
      'id': 'wms-glcfs-currents',
      'type': 'raster',
      'source': 'wms-glcfs-currents',
    },
  ]
}

const DATA_URL = './meta_english.json'


export default class Home extends Component {
    constructor(props) {
      super(props);

      this.state = {
        x: null,
        y: null,
        isLoading: true,
        hoveredObject: null,
        data: null,
      };
      requestJson(DATA_URL, (error, response) => {
        if (!error) {
          this.setState({data: response});
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

    _onHover({x, y, object}) {
      this.setState({x, y, hoveredObject: object});
    }

    _renderTooltip() {
      const {x, y, hoveredObject} = this.state;
      if (!hoveredObject) {
          return null;
      }
      const lat = hoveredObject.lat;
      const lng = hoveredObject.lon;
      const name = hoveredObject.longName;
      const owner = hoveredObject.buoyOwners;
      const recovered = hoveredObject.recovered ? 'Yes' : 'No';
      return (
        <div className="marker-tooltip" style={{left: x, top: y}}>
            <div><b>{`${name}`}</b></div>
            <div>{`latitude: ${Number.isFinite(lat) ? lat.toFixed(3) : ''}`}</div>
            <div>{`longitude: ${Number.isFinite(lng) ? lng.toFixed(3) : ''}`}</div>
            <div>{`Owner: ${owner}`}</div>
            <div>{`Recovered: ${recovered}`}</div>
        </div>
      );
    }

    renderLander() {
      return (
        <div className="lander">
          <h1>GLOS Chick Demo App</h1>
          <p>A simple react app</p>
        </div>
      );
    }

    renderMap() {
      const {data} = this.state;
      if (!data) {
        return null;
      }
      const ICON_MAPPING = {
        marker: {x: 0, y: 0, width: 20, height: 50, mask: true}
      };

      const layer = new IconLayer({
        id: 'icon-layer',
        data: data,
        pickable: true,
        iconAtlas: 'https://a.tiles.mapbox.com/v3/marker/pin-s+BB9427.png',
        iconMapping: ICON_MAPPING,
        sizeScale: 5,
        getIcon: d => 'marker',

        getPosition: d => [d.lon, d.lat],
        getSize: d => 15,
        getColor: d => d.recovered ? [220,20,60] : [55,126,184],
        onHover: station => this.setState({
          hoveredObject: station.object,
          x: station.x,
          y: station.y
        }),
        onClick: station => {
          // Redirect to station dashboard page
          let route = '/' + station.object.id;
          this.props.history.push(route);
        }
      });

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
        data: data,
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
        <div className="home-container">
          <div className="map-container">
            {this._renderTooltip()}
            <DeckGL initialViewState={viewstate} controller={true} layers={[layer]}>
              <StaticMap mapStyle={mapStyle} mapboxApiAccessToken={token} />
            </DeckGL>
          </div>
        </div>
      )
    }

    render() {
        return <div className="Home">{this.props.isAuthenticated ? this.renderMap() : this.renderLander()}</div>;
    }
}
