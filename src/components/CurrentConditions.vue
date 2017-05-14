<template>
  <div class="current-conditions">
    <div class="row">
      <div class="small-5 columns text-center">
        <i class="wx-icon wi" v-bind:class="[wx.wxIcon]"></i>
        <div class="weather">{{ wx.weather }}</div>
      </div>
      <div class="small-7 columns">
        <div class="wx-row city">{{ wx.location.city }}, {{ wx.location.state }}</div>
        <div class="wx-row temp">{{ wx.temp.f }}&deg;</div>
        <div class="wx-row">
          <span class="wx-label">Humidity:</span>
          <span>{{ wx.relativeHumidity }}</span>
        </div>
        <div class="wx-row">
          <span class="wx-label">Dewpoint:</span>
          <span>{{ wx.dewpoint.f }}&deg;</span>
        </div>
      </div>
    </div>
    <div class="row hourly-details">
      <div class="small-12 columns">
        <h4 class="text-center">12-hour Forecast</h4>
        <div class="chart-container">
          <canvas class="chart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import Chart from 'chart.js'

console.clear();

const apiPrefix = 'http://api.wunderground.com/api/1e0a7bd45ab35633';
const red = 'rgba(254, 74, 73, 0.9)';
const blue = 'rgba(42, 183, 202, 0.9)';

/**
 * Map of Wunderground API weather condition states to weather icon class names.
 *
 * Icons: https://erikflowers.github.io/weather-icons
 */
const weatherIconMap = {
  clear: 'wi-day-sunny',
  cloudy: 'wi-day-cloudy',
  fog: 'wi-day-cloudy',
  sleet: 'wi-day-sleet',
  snow: 'wi-day-snow',
  rain: 'wi-day-rain'
};

export default {
  name: 'chart',

  data() {
    return {
      zip: null,
      geoCoordinates: {
        latitude: null,
        longitude: null
      },
      wx: {
        station: {
          city: '',
          state: '',
          country: '',
          full: '',
          elevation: '',
          latitude: '',
          longitude: '',
        },
        location: {
          city: '',
          state: '',
          country: '',
          elevation: '',
          fullName: '',
          latitude: '',
          longitude: '',
          zip: '',
        },
        updatedAt: {
          epoch: null,
          date: null,
          timestamp: null
        },
        weather: null,
        temp: {
          c: null,
          f: null,
          k: null
        },
        dewpoint: {
          c: null,
          f: null
        },
        relativeHumidity: null,
        heatIndex: {
          c: null,
          f: null
        },
        uv: null,
        icon: null,
        wxIcon: null
      },
      forecast: {
        hourly: null
      },
      chartLabels: [],
      chartDatasets: []
    }
  },

  watch: {
    geoCoordinates(value) {
      let currentConditionsUrl = `${apiPrefix}/conditions/q/${value.latitude},${value.longitude}.json`;

      let key = 'wx';
      let wxData = this.getData(key);

      if (!wxData) {
        this.getWxData(currentConditionsUrl)
          .then(this.setData.bind(this))
          .then(() => {
            console.debug('No data to start, but data has been fetched and set now!');
          });

      } else {
        let savedWxData = JSON.parse(wxData);
        let epochNow = moment().unix();
        let elapsedMinutes = this.getElapsedMinutes(epochNow, savedWxData.checkedAt.epoch);

        // Only get new weather data every 10 minutes
        if (elapsedMinutes >= 10) {
          console.debug('Fetching new weather data...');

          this.getWxData(currentConditionsUrl)
            .then(this.setData.bind(this))
            .then(() => {
              console.debug('Data has been set!');
            });
        } else {
          this.wx = JSON.parse(wxData);
        }
      }

      // let hourlyUrl = `${apiPrefix}/hourly/q/${value.latitude},${value.longitude}.json`;

      // axios.get(hourlyUrl).then((res) => {
      //   let data = res.data.hourly_forecast;

      //   let mappedData = _.map(data, (hourlyData) => {
      //     // console.debug('value', hourlyData);

      //     return {
      //       epoch: hourlyData.FCTTIME.epoch,
      //       temp: {
      //         f: hourlyData.temp.english,
      //         c: hourlyData.temp.metric
      //       },
      //       relativeHumidity: hourlyData.humidity
      //     };
      //   });

      //   this.forecast.hourly = mappedData;
      //   this.chartLabels = this.extractDates(this.forecast.hourly);

      //   let temps = _.map(this.forecast.hourly, 'temp.f');
      //   temps.length = 12;

      //   this.chartDatasets = [
      //     {
      //       label: 'Temp',
      //       fill: false,
      //       data: temps,
      //       borderColor: red,
      //       pointRadius: 0.5,
      //       pointHitRadius: 5,
      //       pointHoverBackgroundColor: red,
      //       pointHoverBorderColor: red
      //     }
      //   ];

      //   // console.debug('extractDates', this.extractDates(this.forecast.hourly));

      //   let hourlyTimes = this.extractDates(this.forecast.hourly);

      //   console.debug('this.chartDatasets', hourlyTimes.length);

      //   hourlyTimes.length = 12;

      //   this.setLabels(hourlyTimes);
      //   this.setDatasets(this.chartDatasets);
      //   this.renderChart(true);

      //   // console.debug('Hourly data...', this.forecast.hourly);
      // });
    }
  },

  methods: {
    getElapsedMinutes(epochNow, epochBefore) {
      let elapsedSeconds = epochNow - epochBefore;

      return elapsedSeconds / 60;
    },

    getWxData(url) {
      return axios.get(url);
    },

    setData(res) {
      console.debug('Setting data...', res);

      let data = res.data.current_observation;

      this.icon = weatherIconMap[data.icon_url];

      this.wx = {
        station: {
          city: data.observation_location.city,
          state: data.observation_location.state,
          country: data.observation_location.country,
          full: data.observation_location.full,
          elevation: data.observation_location.elevation,
          latitude: data.observation_location.latitude,
          longitude: data.observation_location.latitude,
        },
        location: {
          city: data.display_location.city,
          state: data.display_location.state,
          country: data.display_location.country,
          elevation: data.display_location.elevation,
          fullName: data.display_location.full,
          latitude: data.display_location.latitude,
          longitude: data.display_location.longitude,
          zip: data.display_location.zip,
        },
        updatedAt: {
          epoch: data.observation_epoch,
          date: new Date(data.observation_epoch * 1000),
          timestamp: data.observation_epoch * 1000
        },
        checkedAt: {
          epoch: moment().unix()
        },
        weather: data.weather,
        temp: {
          c: data.temp_c,
          f: data.temp_f,
          k: data.temp_c + 273.15 // Kelvin
        },
        dewpoint: {
          c: data.dewpoint_c,
          f: data.dewpoint_f
        },
        relativeHumidity: data.relative_humidity,
        heatIndex: {
          c: data.heat_index_c,
          f: data.heat_index_f
        },
        uv: data.uv,
        icon: data.icon,
        wxIcon: weatherIconMap[data.icon]
      };

      this.storeData('wx', this.wx);
    },

    storeData(key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    },

    getData(key) {
      return localStorage.getItem(key);
    },

    extractDates(arr) {
      return _.map(arr, (data, index) => {
        let date = moment.unix(data.epoch);

        return date.format('ha');
      });
    },

    extractTemps(arr) {
      return _.map(arr, (data, index) => {
        return {
          high: dayData.high.fahrenheit,
          low: dayData.low.fahrenheit
        };
      });
    },

    setDatasets(datasets) {
      this.chartHourly.data.datasets = datasets;
    },

    setLabels(labels) {
      this.chartHourly.data.labels = labels;
    },

    renderChart(update) {
      console.debug('Rendering chart...', this.chartHourly);

      if (update) {
        this.chartHourly.update();
      } else {
        this.chartHourly.render();
      }
    }
  },

  beforeCreate() {
    let geoLocationApiUrl = 'http://freegeoip.net/json/';

    axios.get(geoLocationApiUrl).then((res) => {
      // console.debug('Location API Response...', res.data);

      this.geoCoordinates = {
        latitude: res.data.latitude,
        longitude: res.data.longitude
      };
    });
  },

  created: function () {
    // console.debug('created...');
  },

  mounted() {
    this.canvasElement = this.$el.querySelector('canvas');

    Chart.defaults.global.legend = {
      display: false
    };

    this.chartHourly = new Chart(this.canvasElement, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: this.chartDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              padding: 5,
              // mirror: true
            },
            gridLines: {
              drawTicks: false
            }
          }],
          xAxes: [{
            ticks: {
              // labelOffset: 10,
              padding: 0,
              mirror: false,
              maxRotation: 0,
              fontSize: 10,
              callback: function (value, index, values) {
                console.debug('Tick...', index, values.length - 1);

                if (index === 0) {
                  return;
                }

                if (index % 2 === 0) {
                  return value;
                }
              }
            },
            gridLines: {
              drawTicks: false
            }
          }]
        }
      }
    });

    this.renderChart(false);
  }
}
</script>

<style scoped>
.current-conditions {
  padding-top: 1rem;
  line-height: 1;
}

.wx-icon {
  font-size: 6rem;
}

.wi-day-sunny {
  color: #FFCD2B;
}

.weather {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.city {
  font-size: 1.5rem;
  /*font-weight: 600;*/
}

.temp {
  font-size: 3.5rem;
  font-weight: 600;
}

.wx-row {
  margin-bottom: 0.5rem;
}

.wx-label {
  font-weight: 600;
}

.hourly-details {
  margin-top: 2rem;
}

.chart-container {
  height: 20vh;
  max-height: 120px;
  width: 90vw;

  canvas {
    height: inherit;
    width: inherit;
  }
}
</style>
