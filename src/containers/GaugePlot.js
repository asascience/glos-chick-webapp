import React from 'react'
import { render } from 'react-dom'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts-more'
HighchartsMore(Highcharts)


class GaugePlot extends React.Component {
  render () {
    let stream = this.props.stream;
    let phValue = stream[0].ph;
    let backgroundColor = '#55BF3B';
    if (phValue > 10 || phValue < 4) {
      backgroundColor = '#DF5353';
    } else if (phValue > 8.5 || phValue < 6) {
      backgroundColor = '#DDDF0D';
    }
    const options = {
      chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false
      },
      title: {
        text: 'pH @ ' + stream[0].station
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

      // the value axis
      yAxis: {
        min: 0,
        max: 14,

        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',

        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        labels: {
          step: 2,
          rotation: 'auto'
        },
        title: {
          text: 'pH'
        },
        plotBands: [
          {
            from: 0,
            to: 4,
            color: '#DF5353' // red
          },
          {
            from: 4,
            to: 6,
            color: '#DDDF0D' // yellow
          },
          {
            from: 6,
            to: 8.5,
            color: '#55BF3B' // green
          },
          {
            from: 8.5,
            to: 10,
            color: '#DDDF0D' // yellow
          },
          {
            from: 10,
            to: 14,
            color: '#DF5353' // red
          }
        ]
      },

      series: [{
        name: 'pH',
        data: [phValue],
        tooltip: {
          valueSuffix: ' '
        },
        dataLabels: {
          backgroundColor: backgroundColor,
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