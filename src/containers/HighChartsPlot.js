import React from 'react'
import { render } from 'react-dom'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const options = {
    chart: {
        type: 'spline',
        events: {
            load: function () {

                // set up the updating of the chart each second
                var series = this.series[0];
                setInterval(function () {
                    var x = (new Date()).getTime(), // current time
                        y = Math.random();
                    series.addPoint([x, y], true, true);
                }, 1000);
            }
        }
    },
    title: {
        text: 'Streaming Data'
    },
    series: [{
        name: 'Random data',
        data: (function () {
            // generate an array of random data
            var data = [],
                time = (new Date()).getTime(),
                i;

            for (i = -19; i <= 0; i += 1) {
                data.push({
                    x: time + i * 1000,
                    y: Math.random()
                });
            }
            return data;
        }())
    }]
}

// const options = {
//     chart: {
//         type: 'spline'
//     },
//   title: {
//     text: 'Streaming Data'
//   },
//   series: [{
//     data: [1, 2, 3]
//   }]
// }


// let defaultData = 'https://demo-live-data.highcharts.com/time-data.csv';
// let urlInput = document.getElementById('fetchURL');
// let pollingCheckbox = document.getElementById('enablePolling');
// let pollingInput = document.getElementById('pollingTime');

class HighChartsPlot extends React.Component {
    render () {
        return (
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        )
    }
}
export default HighChartsPlot