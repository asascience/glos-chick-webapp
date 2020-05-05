import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment'
import '../index.css';

const categoryMapping = {
  NA: {text: 'Not Available', color: '#FF0000'},
  ND: {text: '0 >= value <= LLOD', color: '#808080'},
  B: {text: 'LLOD < value < LLOQ', color: '#add8e6'},
  A: {text: 'value >= LLOQ', color: '#ffa500'},
  N: {text: 'Normal Value', color: '#0000ff'}
};

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
    // let data = this.props.data
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

class TimeSeriesEspPlot extends React.Component {

  constructor() {
    super();

    this.createLegend = this.createLegend.bind(this);
  }

  createLegend(chart) {
    let classifications = ['ND', 'B', 'A', 'N'];

    return classifications.map(classification => {
      return (
          <div className="custom-legend-item">
            <span
                className={"custom-legend-symbol"}
                style={{backgroundColor: categoryMapping[classification].color}}>
            </span>
            <span className={"custom-legend-symbol-text"}>
              {categoryMapping[classification].text}
            </span>
          </div>
        )
    });
  }

  render () {
    let self = this;
    let data = this.props.data;
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
        let category = data.category[i];
        if (Array.isArray(value)) {
          let ind = depth === 'surface' ? 0 : 1;
          value = value[ind];
          category = category[ind];
        }
        seriesData.push({
          x: moment(data.times[i]).valueOf(),
          y: category !== 'NA' ? parseFloat(value) : null,
          marker: category !== 'NA' ?
              {enabled: true, fillColor: categoryMapping[category].color} : null,
          classification: categoryMapping[category].text,
          uom: units,
          fullname: prettyName,
          depth: depth
        });
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
        enabled: true
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
            (this.y + ' ' + this.uom) +
            ' ' + (this.depth !== null ? '@ ' + this.depth : ''),
            this.classification ? '<br/>' + this.classification : ''
          ].join('');
        }
      },
      series: series
    };
    return (
        <>
          <HighchartsReact
              highcharts={Highcharts}
              options={options}
              callback={this.createLegend}
          />
          <div style={{display: 'flex', justifyContent: 'center'}}>{this.createLegend()}</div>
        </>
    )
  }
}

export {TimeSeriesPlot, TimeSeriesHabsPlot, TimeSeriesEspPlot}
