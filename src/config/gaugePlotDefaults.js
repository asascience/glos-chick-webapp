export default {
  'Turbidity (ntu)': {
    dangerThreshold: 10,
    warningThreshold: 10,
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
          to: 1000,
          color: '#DF5353' // red
        }
      ]
    }
  },
  'Blue Green Algae (rfu)': {
    dangerThreshold: 3,
    warningThreshold: 2,
    yAxis: {
      min: -1,
      max: 5,

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
          from: -1,
          to: 2,
          color: '#55BF3B' // green
        },
        {
          from: 2,
          to: 3,
          color: '#DDDF0D' // yellow
        },
        {
          from: 3,
          to: 5,
          color: '#DF5353' // red
        }
      ]
    }
  },
  'Extracted Phycocyanin': {
    dangerThreshold: 3,
    warningThreshold: 2,
    yAxis: {
      min: -1,
      max: 5,

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
          from: -1,
          to: 2,
          color: '#55BF3B' // green
        },
        {
          from: 2,
          to: 3,
          color: '#DDDF0D' // yellow
        },
        {
          from: 3,
          to: 5,
          color: '#DF5353' // red
        }
      ]
    }
  },
  'Dissolved Microcystin': {
    dangerThreshold: 3,
    warningThreshold: 2,
    yAxis: {
      min: -1,
      max: 5,

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
          from: -1,
          to: 2,
          color: '#55BF3B' // green
        },
        {
          from: 2,
          to: 3,
          color: '#DDDF0D' // yellow
        },
        {
          from: 3,
          to: 5,
          color: '#DF5353' // red
        }
      ]
    }
  },
  'Particulate Microcystin': {
    dangerThreshold: 3,
    warningThreshold: 2,
    yAxis: {
      min: -1,
      max: 5,

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
          from: -1,
          to: 2,
          color: '#55BF3B' // green
        },
        {
          from: 2,
          to: 3,
          color: '#DDDF0D' // yellow
        },
        {
          from: 3,
          to: 5,
          color: '#DF5353' // red
        }
      ]
    }
  },
}