export default {
  Turbidity: {
    yAxis: {
      min: 0,
      max: 15,

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
        text: ''
      },
      plotBands: [
        {
          from: 0,
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
          to: 15,
          color: '#DF5353' // red
        }
      ]
    }
  }
}