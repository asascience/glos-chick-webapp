import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment';
import _Set from 'lodash.set';
import _CloneDeep from 'lodash.clonedeep';
import {ESP_TIMESERIES_CHART_OPTIONS, ESP_CATEGORY_MAPPING, ESP_CLASSIFICATIONS} from "../config/chartConfig";
import '../index.css';

class TimeSeriesPlot extends React.Component {
  render () {
    let self = this;
    let stream = this.props.stream;
    let parameters = this.props.parameters;
    let color = this.props.color;
    let subtitle = this.props.subtitle;
    let series = [];
    let prettyName = this.props.parameterMapping[parameters[0]];
    let units = prettyName.indexOf('(') > -1 ? '(' + prettyName.split('(')[1] : '';
    let timestamp = 'timestamp' in stream[0] ? 'timestamp' : 'date';

    parameters.map((param, idx) => {
      let seriesData = [];
      let zones = [];
      for (var i = stream.length - 1; i >= 0; i--) {
        seriesData.push({
          x: stream[i][timestamp] * 1000,
          y: stream[i][param],
        });
      }
      if (prettyName === 'Turbidity (ntu)') {
        zones = [
          {
            value: 8,
            color: '#008000'
          },
          {
            value: 10,
            color: '#ffbf00'
          },
          {
            color: '#ff0033'
          }
        ]
      }
      return series.push({
        name: self.props.parameterMapping[param],
        data: seriesData,
        color: color,
        zones: zones
      });
    });
    const options = {
      chart: {
        type: 'spline',
        height: 250,
      },
      time: {
        useUTC: false
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {text: units}
      },
      title: {
        text: prettyName
      },
      subtitle: {
        text: subtitle
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      series: series
    };
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    )
  }
}

/*
  This component generates a HighCharts plot from input geojson
 */
class TimeSeriesHabsPlot extends React.Component {
  render () {
    let self = this;
    let data = this.props.data;
    debugger;
    let parameters = this.props.parameters;
    let depth = this.props.depth;
    let color = this.props.color;
    let series = [];
    let prettyName = this.props.parameterMapping[parameters[0]];
    let units = data.units;

    parameters.map((param, idx) => {
      let seriesData = [];
      let zones = [];
      for (var i = 0; i <= data.times.length - 1; i++) {
        let value = data.values[i];
        if (Array.isArray(value)) {
          let ind = depth === 'surface' ? 0 : 1;
          value = value[ind];
        }
        seriesData.push({
          x: moment(data.times[i]).valueOf(),
          y: value === 'bdl' ? 0.0001 : parseFloat(value),
          marker: value === 'bdl' ? {enabled: true, radius: 8, fillColor: '#FFBBFF'} : null,
          bdl: value === 'bdl',
          uom: units,
          fullname: prettyName,
          depth: depth
        });
      }
      if (prettyName === 'Turbidity (ntu)') {
        zones = [
          {
            value: 8,
            color: '#008000'
          },
          {
            value: 10,
            color: '#ffbf00'
          },
          {
            color: '#ff0033'
          }
        ]
      }
      return series.push({
        name: self.props.parameterMapping[param],
        data: seriesData,
        color: color,
        zones: zones,
        type: 'spline'
      });
    });
    const options = {
      chart: {
        type: 'spline',
        height: 250,
      },
      time: {
        useUTC: false
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {text: units}
      },
      title: {
        text: prettyName
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        spline: {
          keys: ['x', 'y', 'marker'],
        }
      },
      tooltip: {
        pointFormatter: function() {
          return [
            '<b>' + this.fullname +'</b>' + '<br/>',
            (this.bdl ? 'Below Detection Limit' : this.y + ' ' + this.uom) +
            ' ' + (this.depth !== null ? '@ ' + this.depth : '')
          ].join('');
        }
      },
      series: series
    };
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    )
  }
}

function TimeSeriesEspPlot(props) {

  const {data, parameters, depth, color, parameterMapping} = props;

  const [showCustomLegend, setShowCustomLegend] = React.useState(false);

  let prettyName = parameterMapping[parameters[0]];
  let units = data.units;

  const createLegend = () => {
    return ESP_CLASSIFICATIONS.map(classification => {
      return (
          <div className="custom-legend-item">
            <span
                className={"custom-legend-symbol"}
                style={{backgroundColor: ESP_CATEGORY_MAPPING[classification].color}}>
            </span>
            <span className={"custom-legend-symbol-text"}>
              {ESP_CATEGORY_MAPPING[classification].legendText}
            </span>
          </div>
      )
    });
  };

  const buildConfig = (parameters,data) => {
    let series = [];

    parameters.forEach((param, idx) => {
      let seriesData = [];
      for (let i = 0; i <= data.times.length - 1; i++) {
        let value = data.values[i];
        let category = data.category[i] || 'NA';
        if (Array.isArray(value)) {
          let ind = depth === 'surface' ? 0 : 1;
          value = value[ind];
          category = category[ind] || 'NA';
        }

        seriesData.push({
          x: moment(data.times[i]).valueOf(),
          y: category !== 'NA' ? parseFloat(value) : null,
          marker: category !== 'NA' ?
              {enabled: true, fillColor: ESP_CATEGORY_MAPPING[category].color} : null,
          classification: ESP_CATEGORY_MAPPING[category].descriptionTitleText,
          uom: units,
          fullname: prettyName,
          depth: depth
        });
      }

      series.push({
        name: parameterMapping[param],
        data: seriesData,
        color: color,
        type: 'spline'
      });
    });

    let options = _CloneDeep(ESP_TIMESERIES_CHART_OPTIONS);

    _Set(options, 'title.text', prettyName);
    _Set(options, 'yAxis.title.text', units);
    _Set(options, 'series', series);

    return options
  };

  return (
      <>
        <HighchartsReact
            highcharts={Highcharts}
            options={buildConfig(parameters,data)}
            callback={() => {setShowCustomLegend(true)}}
        />
        {showCustomLegend && <div style={{display: 'flex', justifyContent: 'center'}}>{createLegend()}</div>}
      </>
  )
}


export {TimeSeriesPlot, TimeSeriesHabsPlot, TimeSeriesEspPlot}
