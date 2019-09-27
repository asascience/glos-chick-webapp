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
      minorTickColor: '#336E7B',

      tickPixelInterval: 30,
      tickWidth: 2,
      tickPosition: 'inside',
      tickLength: 15,
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
          color: '#54C6DF' // blue
        },
        {
          from: 8.5,
          to: 10,
          color: '#A3E3C3' // light green
        },
        {
          from: 10,
          to: 1000,
          color: '#049372' // dark green
        }
      ]
    }
  },
  'Turbidity': {
    dangerThreshold: 10,
    warningThreshold: 10,
    yAxis: {
      min: 0,
      max: 15,

      minorTickInterval: 'auto',
      minorTickWidth: 1,
      minorTickLength: 10,
      minorTickPosition: 'inside',
      minorTickColor: '#336E7B',

      tickPixelInterval: 30,
      tickWidth: 2,
      tickPosition: 'inside',
      tickLength: 15,
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
          color: '#54C6DF' // blue
        },
        {
          from: 8.5,
          to: 10,
          color: '#A3E3C3' // light green
        },
        {
          from: 10,
          to: 1000,
          color: '#049372' // dark green
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
      minorTickColor: '#336E7B',

      tickPixelInterval: 30,
      tickWidth: 2,
      tickPosition: 'inside',
      tickLength: 15,
      tickColor: '#336E7B',
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
          color: '#54C6DF' // blue
        },
        {
          from: 2,
          to: 3,
          color: '#A3E3C3' // light green
        },
        {
          from: 3,
          to: 5,
          color: '#049372' // dark green
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
      minorTickColor: '#336E7B',

      tickPixelInterval: 30,
      tickWidth: 2,
      tickPosition: 'inside',
      tickLength: 15,
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
          color: '#54C6DF' // blue
        },
        {
          from: 2,
          to: 3,
          color: '#A3E3C3' // light green
        },
        {
          from: 3,
          to: 5,
          color: '#049372' // dark green
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
      minorTickColor: '#336E7B',

      tickPixelInterval: 30,
      tickWidth: 2,
      tickPosition: 'inside',
      tickLength: 15,
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
          color: '#54C6DF' // blue
        },
        {
          from: 2,
          to: 3,
          color: '#A3E3C3' // light green
        },
        {
          from: 3,
          to: 5,
          color: '#049372' // dark green
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
      minorTickColor: '#336E7B',

      tickPixelInterval: 30,
      tickWidth: 2,
      tickPosition: 'inside',
      tickLength: 15,
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
          color: '#54C6DF' // blue
        },
        {
          from: 2,
          to: 3,
          color: '#A3E3C3' // light green
        },
        {
          from: 3,
          to: 5,
          color: '#049372' // dark green
        }
      ]
    }
  },
}