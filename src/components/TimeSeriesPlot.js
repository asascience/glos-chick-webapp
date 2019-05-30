import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


class TimeSeriesPlot extends React.Component {
  render () {
    let self = this;
    let stream = this.props.stream;
    let parameters = this.props.parameters;
    let color = this.props.color;
    let series = [];
    let prettyName = this.props.parameterMapping[parameters[0]]
    parameters.map((param, idx) => {
      let seriesData = [];
      let zones = [];
      for (var i = stream.length - 1; i >= 0; i--) {
        seriesData.push({
          x: stream[i].date,
          y: stream[i][param],
        });
      }
      if (param === 'ph') {
        zones = [
          {
            value: 8.35,
            color: '#008000'
          },
          {
            value: 8.375,
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
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {text: 'units'}
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
    }
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    )
  }
}
export default TimeSeriesPlot