import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


class TimeSeriesPlot extends React.Component {
  render () {
    let stream = this.props.stream;
    let parameters = this.props.parameters;
    let color = this.props.color;
    let series = [];
    parameters.map((param, idx) => {
      let seriesData = [];
      for (var i = stream.length - 1; i >= 0; i--) {
        seriesData.push({
          x: stream[i].date,
          y: stream[i][param],
        });
      }
      return series.push({
        name: param,
        data: seriesData,
        color: color
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
          text: parameters[0]
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