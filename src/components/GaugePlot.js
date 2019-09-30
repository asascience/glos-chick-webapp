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
      plotOptions: {
        gauge: {
          dial: {
            radius: '60%',
            backgroundColor: '#034554',
            baseWidth: 3,
            topWidth: 1,
            baseLength: '90%', // of radius
            rearLength: '0%'
          },
          pivot: {
            backgroundColor: '#034554',
            borderColor:"#000",
            radius: 4
          }
        }
      },
      credits: {
        enabled: false
      },
      title: {
        text: prettyName
      },
      pane: {
        startAngle: -90,
        endAngle: 90,
        background: []
      },
      series: [{
        name: prettyName,
        data: [value],
        tooltip: {
          valuePrefix: value >= 15 ? '>' : ''
        },
        dataLabels: {
          backgroundColor: null,
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