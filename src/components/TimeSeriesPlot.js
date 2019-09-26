import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment'



class TimeSeriesPlot extends React.Component {
  render () {
    let self = this;
    let stream = this.props.stream;
    let parameters = this.props.parameters;
    let color = this.props.color;
    let series = [];
    let prettyName = this.props.parameterMapping[parameters[0]];
    let units = '(' + prettyName.split('(')[1];
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
    let color = this.props.color;
    let series = [];
    let prettyName = this.props.parameterMapping[parameters[0]];
    let units = data.units;

    parameters.map((param, idx) => {
      let seriesData = [];
      let zones = [];
      for (var i = 0; i <= data.times.length - 1; i++) {
        seriesData.push({
          x: moment(data.times[i]).valueOf(),
          y: data.values[i] === 'bdl' ? 0.0001 : parseFloat(data.values[i]),
          marker: data.values[i] === 'bdl' ? {enabled: true, radius: 8, fillColor: '#FFBBFF'} : null,
          bdl: data.values[i] === 'bdl',
          uom: units,
          fullname: prettyName,
          depth: null
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
        type: 'spline',
        // dataLabels: {
        //   formatter: function() {
        //     return this.point.properties['woe-label'].split(',')[0];
        //   }
        // },

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
export {TimeSeriesPlot, TimeSeriesHabsPlot}
