<template>
  <div class="chart-container">
    <div class="row collapse">
      <div class="small-12 columns">
        <label for="zip">Zip Code</label>
        <input id="zip" type="text" name="zip" v-model="zip">
      </div>
    </div>
    <canvas class="chart"></canvas>
  </div>
</template>


<script>
import Chart from 'chart.js'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import GeolocationModel from '../app/GeolocationModel'

const red = 'rgba(254, 74, 73, 0.9)';
const blue = 'rgba(42, 183, 202, 0.9)';

console.clear()
console.log('')
// console.debug('GeolocationModel', GeolocationModel)

/* eslint-disable no-new */
export default {
  name: 'chart',

  data() {
    return {
      zip: 'test',
      forecastData: [],
      labels: [],
      datasets: [],
    }
  },

  watch: {
    chartData: function () {

    },

    forecastData: function (forecast) {
      console.debug('Watch forecastData...', forecast);

      let dates = this.extractDates(forecast);
      let temps = this.extractTemps(forecast);

      // console.debug('Dates:', dates);
      // console.debug('Temps:', temps);
      // console.debug('Highs:', _.map(temps, 'high'));
      // console.debug('Lows: ', _.map(temps, 'low'));

      let datesets = [
        {
          label: 'Highs',
          fill: false,
          data: _.map(temps, 'high'),
          borderColor: red
        },
        {
          label: 'Lows',
          fill: false,
          data: _.map(temps, 'low'),
          borderColor: blue
        },
      ];

      this.setLabels(dates);
      this.setDatasets(datesets);
      this.renderChart(true);
    }
  },

  methods: {
    extractDates(arr) {
      return _.map(arr, function (dayData, index) {
        let date = moment.unix(dayData.date.epoch);

        return date.format('ddd MMM D');
      });
    },

    extractTemps(arr) {
      return _.map(arr, function (dayData, index) {
        return {
          high: dayData.high.fahrenheit,
          low: dayData.low.fahrenheit
        };
      });
    },

    setDatasets(datasets) {
      this._chart.data.datasets = datasets;
    },

    setLabels(labels) {
      this._chart.data.labels = labels;
    },

    renderChart: function (update) {
      console.debug('Rendering...', this._chart.data.datasets);

      if (update) {
        this._chart.update();
      } else {
        this._chart.render();
      }
    }
  },

  beforeCreate() {
    this.geolocationModel = new GeolocationModel();

    this.geolocationModel.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });


    // console.debug('beforeCreate...', this);

    let tenDayForecastUrl = 'http://api.wunderground.com/api/1e0a7bd45ab35633/forecast10day/q/TN/Nashville.json';

    let currentConditionsUrl = 'http://api.wunderground.com/api/1e0a7bd45ab35633/conditions/q/CA/San_Francisco.json';

    // api.wunderground.com/api/1e0a7bd45ab35633/history_'+ date +'/q/81657.json

    // let request = new Request(endpoint, {
    //   method: 'get',
    // });

    axios.get(tenDayForecastUrl).then((res) => {
      let forecastData = res.data.forecast.simpleforecast.forecastday;

      console.debug('Forecast...', forecastData[0]);

      this.forecastData = forecastData;
    })
  },

  created: function () {
    // console.debug('created...     ', this);
  },

  mounted() {
    console.debug('mounted...     ', this.datasets)

    this.canvasElement = this.$el.querySelector('canvas')

    // init chart.js
    this._chart = new Chart(this.canvasElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    })

    this.renderChart(false);
  }
}
</script>

<style type="text/css" scoped>
  .chart {
    height: 200px;
    width: 320px;
    margin: 0 auto;
  }
</style>
