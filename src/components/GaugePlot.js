import gaugePlotDefaults from '../config/gaugePlotDefaults';
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts-more'
HighchartsMore(Highcharts)


class GaugePlot extends React.Component {
  render () {
    let stream = this.props.stream;
    let parameter = this.props.parameter;
    let parameterMapping = this.props.parameterMapping;
    let prettyName = parameterMapping[parameter];
    let value = stream[0][parameter];
    let backgroundColor = '#55BF3B';
    if (value > 10 || value < 4) {
      backgroundColor = '#DF5353';
    } else if (value > 8.5 || value < 6) {
      backgroundColor = '#DDDF0D';
    }
    let yaxis = gaugePlotDefaults['Turbidity'].yAxis;

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