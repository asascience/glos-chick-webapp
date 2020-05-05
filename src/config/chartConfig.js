const ESP_TIMESERIES_CHART_OPTIONS = {
    chart: {
        type: 'spline',
        height: 250,
    },
    time: {
        useUTC: false
    },
    xAxis: {
        type: 'datetime'
    },
    yAxis: {
        title: {text: null}
    },
    title: {
        text: null
    },
    legend: {
        enabled: true
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        spline: {
            keys: ['x', 'y', 'marker'],
        }
    },
    tooltip: {
        pointFormatter: function () {
            return [
                '<b>' + this.fullname + '</b>' + '<br/>',
                (this.y + ' ' + this.uom) +
                ' ' + (this.depth !== null ? '@ ' + this.depth : ''),
                this.classification ? '<br/>' + this.classification : ''
            ].join('');
        }
    },
    series: null
};

export {
    ESP_TIMESERIES_CHART_OPTIONS
}
