import React from 'react'
import { render } from 'react-dom'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


class TimeSeriesPlot extends React.Component {
  render () {
    let stream = this.props.stream;
    let parameters = this.props.parameters;
    let series = [];
    parameters.map((param, idx) => {
      let seriesData = [];
      for (var i = stream.length - 1; i >= 0; i--) {
        seriesData.push({
          x: stream[i].date,
          y: stream[i][param],
        });
      }
      series.push({
        name: param,
        data: seriesData
      });
    });
    const options = {
        chart: {
            type: 'spline',
        },
        xAxis: {
          type: 'datetime'
        },
        // yAxis: {
        //   title: {text:}
        // },
        title: {
          text: stream[0].station
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