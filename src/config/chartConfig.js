const ESP_CLASSIFICATIONS = ['N', 'ND', 'B', 'A', 'E'];

const ESP_CATEGORY_MAPPING = {
    NA: {
        legendText: 'Not Available',
        color: '#FF0000'
    },
    ND: {
        legendText: '<=LLOD',
        descriptionTitleText: 'y<=LLOD',
        description: 'Value is below or equal to the Lower Limit Of Detection; value could range from 0 to the LLOD. The LLOD represents the sensor’s ability to detect microcystin for the sample volume filtered (indicated as dark grey).',
        color: '#808080'
    },
    B: {
        legendText: 'LLOD < y < LLOQ',
        descriptionTitleText: 'LLOD < y < LLOQ',
        description: 'Value is greater than the Lower Limit Of Detection but less than the Lower Limit Of Quantification; value could range from the LLOD to the LLOQ value. The value reported represents the average of the LLOD and LLOQ values for the sample volume filtered (indicated as purple).',
        color: '#6a0dad'
    },
    A: {
        legendText: '>=ULOQ',
        descriptionTitleText: 'y>=ULOQ',
        description: 'Value is greater than or equal to the Upper Limit Of Quantification. Value is above the sensor\'s ability to quantify reliably; true value is greater than the value reported by some unknown amount (indicated as light orange).',
        color: '#ffa500'
    },
    N: {
        legendText: 'Quantifiable',
        descriptionTitleText: 'Quantifiable',
        description: 'Sensor returned a positive value that could be quantified reliably (indicated as blue).',
        color: '#0000ff'
    },
    E: {
        legendText: 'Estimated',
        descriptionTitleText: 'Estimated',
        description: 'When a definitive value is unable to be determined due to some interferences; an estimated value is provided.',
        color: '#d9d9d9'
    }
};

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
        enabled: false
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
    ESP_CLASSIFICATIONS,
    ESP_CATEGORY_MAPPING,
    ESP_TIMESERIES_CHART_OPTIONS
}
