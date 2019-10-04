export default {
  'Turbidity (ntu)': {
    dangerThreshold: 15,
    warningThreshold: 10,
    yAxis: {
      min: 0,
      max: 20,

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
          to: 10,
          thickness: 15,
          color: '#54C6DF' // blue
        },
        {
          from: 10,
          to: 15,
          thickness: 15,
          color: '#A3E3C3' // light green
        },
        {
          from: 15,
          to: 20,
          thickness: 15,
          color: '#049372' // dark green
        }
      ]
    }
  },
  'Turbidity': {
    dangerThreshold: 15,
    warningThreshold: 10,
    yAxis: {
      min: 0,
      max: 20,

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
          to: 10,
          thickness: 15,
          color: '#54C6DF' // blue
        },
        {
          from: 10,
          to: 15,
          thickness: 15,
          color: '#A3E3C3' // light green
        },
        {
          from: 15,
          to: 20,
          thickness: 15,
          color: '#049372' // dark green
        }
      ]
    }
  },

  'Blue Green Algae (rfu)': {
    dangerThreshold: 3,
    warningThreshold: 1,
    yAxis: {
      min: 0,
      max: 6,

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
          from: 0,
          to: 1,
          thickness: 15,
          color: '#54C6DF' // blue
        },
        {
          from: 1,
          to: 3,
          thickness: 15,
          color: '#A3E3C3' // light green
        },
        {
          from: 3,
          to: 6,
          thickness: 15,
          color: '#049372' // dark green
        }
      ]
    }
  },
  'Dissolved Microcystin': {
    dangerThreshold: 1,
    warningThreshold: 0.4,
    yAxis: {
      min: 0,
      max: 2,

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
          to: 0.3,
          thickness: 15,
          color: '#54C6DF' // blue
        },
        {
          from: 0.3,
          to: 1,
          thickness: 15,
          color: '#A3E3C3' // light green
        },
        {
          from: 1,
          to: 2,
          thickness: 15,
          color: '#049372' // dark green
        }
      ]
    }
  },
  'pH': {
    dangerThreshold: 8.5,
    warningThreshold: 8.0,
    yAxis: {
      min: 5,
      max: 10,

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
          from: 5,
          to: 8,
          thickness: 15,
          color: '#54C6DF' // blue
        },
        {
          from: 8,
          to: 8.5,
          thickness: 15,
          color: '#A3E3C3' // light green
        },
        {
          from: 8.5,
          to: 10,
          thickness: 15,
          color: '#049372' // dark green
        }
      ]
    }
  },
}