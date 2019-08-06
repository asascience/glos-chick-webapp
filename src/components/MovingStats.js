/*
    Moving Average and Standard Deviation
    https://dev.to/nestedsoftware/exponential-moving-average-on-streaming-data-4hhl
 */
class MovingStats {
  constructor(len) {
    this.len = len || 10;  // Moving average length
    this.values = {};
    this.mean = {};
    this.trend = {};
    this.variance = 0;
  }

  get beta() {
    return 1 - this.alpha
  }

  average = (arr) => {
    return arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
  }

  update(params, newValues) {
    // newValues is the Stream Object with all the values
    params.map((param, idx) => {

      if (!(param in this.mean)) {
        this.mean[param] = newValues[param];
      }
      if (!(param in this.values)) {
        this.values[param] = [newValues[param]];
        this.mean[param] = newValues[param]
      } else {
        this.values[param].unshift(newValues[param])
      }
      if (this.values[param].length >= this.len) {
        this.values[param] = this.values[param].slice(0, this.len);
      }
      let previousMean = this.mean[param];
      let mean = this.average(this.values[param])
      this.trend[param] = mean > previousMean ? 'up' : 'down';
      this.mean[param] = mean;
    });
  }

  get stdev() {
    return Math.sqrt(this.variance);
  }
}

export default MovingStats