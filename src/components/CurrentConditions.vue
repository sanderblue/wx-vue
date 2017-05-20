<template>
  <div class="current-conditions">
    <div class="row">
      <div class="small-7 columns text-center">
        <i class="wx-icon wi" v-bind:class="[wx.wxIcon]"></i>
        <div class="weather">{{ wx.weather }}</div>
      </div>
      <div class="small-9 columns">
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
      <div class="small-16 columns">
        <h4 class="text-center">12-hour Forecast</h4>
        <div class="chart-container">
          <canvas class="chart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import Chart from 'chart.js';
import jsonp from 'jsonp';

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
  partlycloudy: 'wi-day-cloudy',
  mostlycloudy: 'wi-cloudy',
  cloudy: 'wi-day-cloudy',
  fog: 'wi-fog',
  sleet: 'wi-sleet',
  snow: 'wi-snow',
  rain: 'wi-rain'
};

export default {
  name: 'chart',
  props: [
    'locale'
  ],

  data() {
    return {
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
      chartDatasets: [],
      localeId: null,
    }
  },

  watch: {
    locale: function () {
      console.debug('');
      console.debug('');
      console.debug('LOCALE changed', this.locale);

      let id = `${this.locale}`;
      let apiUrl = `${apiPrefix}/conditions/q/${this.locale}.json`;
      let wxData = this.getData(id);

      this.updateUI(id);
    },

    geoCoordinates(value) {
      this.updateUI(value.zip_code);
    }
  },

  methods: {
    updateUI(locale) {
      console.debug('Update UI for ID...', locale);

      let id = `${locale}`;

      let currentConditionsUrl = `${apiPrefix}/conditions/q/${id}.json`;
      let wxData = this.getData(id);

      if (!wxData) {
        this.getWxData(currentConditionsUrl)
          .then(this.setData.bind(this, id))
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
            .then(this.setData.bind(this, id))
            .then(() => {
              console.debug('Data has been set!');
            });
        } else {
          this.wx = JSON.parse(wxData);
        }
      }

      let hourlyForecastUrl = `${apiPrefix}/hourly/q/${id}.json`;

      this.getHourlyForecastData(hourlyForecastUrl);
    },

    getElapsedMinutes(epochNow, epochBefore) {
      let elapsedSeconds = epochNow - epochBefore;

      return elapsedSeconds / 60;
    },

    getWxData(url) {
      return axios.get(url);
    },

    setData(id, res) {
      console.debug('Setting data...', res);

      let data = res.data.current_observation;

      this.icon = weatherIconMap[data.icon_url];

      // console.debug('weatherIconMap[data.icon]', weatherIconMap[data.icon]);

      this.wx = {
        id: id,
        station: {
          id: data.station_id,
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

      this.storeData(this.wx.id, this.wx);
    },

    storeData(id, data) {
      console.debug('Storing data...', id);

      localStorage.setItem(id, JSON.stringify(data));
    },

    getData(id) {
      console.debug('Get localStorage id...', id);

      return localStorage.getItem(id);
    },

    getHourlyForecastData(url) {
      console.debug('getHourlyForecastData', url);

      let hourlyUrl = url;

      axios.get(hourlyUrl).then((res) => {
        let data = res.data.hourly_forecast;

        let mappedData = _.map(data, (hourlyData) => {
          // console.debug('value', hourlyData);

          return {
            epoch: hourlyData.FCTTIME.epoch,
            temp: {
              f: hourlyData.temp.english,
              c: hourlyData.temp.metric
            },
            relativeHumidity: hourlyData.humidity
          };
        });

        this.forecast.hourly = mappedData;
        this.chartLabels = this.extractDates(this.forecast.hourly);

        let temps = _.map(this.forecast.hourly, 'temp.f');
        temps.length = 12;

        this.chartDatasets = [
          {
            label: 'Temp',
            fill: false,
            data: temps,
            borderColor: red,
            pointRadius: 1.5,
            pointHitRadius: 5,
            pointBackgroundColor: red,
            pointHoverBackgroundColor: red,
            pointHoverBorderColor: red
          }
        ];

        // console.debug('extractDates', this.extractDates(this.forecast.hourly));

        let hourlyTimes = this.extractDates(this.forecast.hourly);

        console.debug('this.chartDatasets', hourlyTimes.length);

        hourlyTimes.length = 12;

        this.setLabels(hourlyTimes);
        this.setDatasets(this.chartDatasets);
        this.renderChart(true);

        // console.debug('Hourly data...', this.forecast.hourly);
      });
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
      console.debug('Location API Response...', res.data);

      this.geoCoordinates = res.data;
    });
  },

  created: function () {
    // console.debug('created...');
  },

  mounted() {
    console.debug('Mounted --- this.wx ', this.wx);

    this.canvasElement = this.$el.querySelector('canvas');

    Chart.defaults.global.legend = {
      display: false
    };

    console.debug('Mounted --- geoCoordinates ', this.geoCoordinates);

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
              fontSize: 10.5,
              callback: function (value, index, values) {
                // console.debug('Tick...', index, values.length - 1);

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
