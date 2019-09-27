import gaugePlotDefaults from '../config/gaugePlotDefaults';
import React from 'react'
import moment from 'moment'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts-more'
HighchartsMore(Highcharts)


class GaugePlot extends React.Component {
  render () {
    let prettyName = this.props.parameter;
    let timestamp = this.props.timestamp;
    let dataPoint = this.props.dataPoint;

    let value = parseFloat(parseFloat(dataPoint).toFixed(2));
    let backgroundColor = '#55BF3B';
    let yaxis = gaugePlotDefaults[prettyName].yAxis;
    let dangerThreshold = gaugePlotDefaults[prettyName].dangerThreshold;
    let warningThreshold = gaugePlotDefaults[prettyName].warningThreshold;

    if (value > 15) {
        value = 15;
    }
    if (value > dangerThreshold) {
      backgroundColor = '#DF5353';
    } else if (value > warningThreshold) {
      backgroundColor = '#DDDF0D';
    }
    const options = {
      yAxis: yaxis,
      chart: {
        height: 250,
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
      },
      credits: {
        enabled: false
      },
      title: {
        text: prettyName
      },
      pane: {
        startAngle: -150,
        endAngle: 150,
        background: [
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#FFF'],
                [1, '#333']
              ]
            },
            borderWidth: 0,
            outerRadius: '109%'
          },
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#333'],
                [1, '#FFF']
              ]
            },
            borderWidth: 1,
            outerRadius: '107%'
          },
          {
              // default background
          },
          {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
          }
        ]
      },
      series: [{
        name: prettyName,
        data: [value],
        tooltip: {
          valuePrefix: value >= 15 ? '>' : ''
        },
        dataLabels: {
          backgroundColor: backgroundColor,
          format: value >= 15 ? '>{point.y}' : '{point.y}'
        }
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
export default GaugePlot