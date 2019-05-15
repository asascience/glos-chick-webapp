import React from 'react'
import { render } from 'react-dom'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


class TimeSeriesPlot extends React.Component {
  render () {
    let stream = this.props.stream;
    let seriesData = [];
    for (var i = stream.length - 1; i >= 0; i--) {
      seriesData.push({
        x: stream[i].date,
        y: stream[i].ph,
      });
    }

    const options = {
        chart: {
            type: 'spline',
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          // min: 0,
          //   max: 14,
            // plotBands: [{
            //     color: '#800000',
            //     from: 10,
            //     to: 15,
            //   }],
        },
        title: {
          text: stream[0].station
        },
        series: [{
          name: 'pH',
          data: seriesData,
        }]
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