<template>
  <div class="current-conditions">
    <div v-if="error" class="text-center">
      <strong>{{ error.description }}</strong>
    </div>

    <div v-if="!error">
      <div class="row">
        <div class="small-7 large-8 columns text-center">
          <i class="wx-icon wi" v-bind:class="[wx.wxIcon]"></i>
          <div class="weather">{{ wx.weather }}</div>
        </div>
        <div class="small-9 large-8 columns">
          <div class="wx-row city">{{ wx.location.city }}, {{ wx.location.state }}</div>
          <div class="wx-row location-elevations">
            <div class="station-elevation">
              <strong>Elevation:</strong>
              <span>{{ wx.station.elevation }}</span>
            </div>
          </div>
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
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import Chart from 'chart.js';
import jsonp from 'jsonp';

const API_PREFIX = 'http://api.wunderground.com/api/1e0a7bd45ab35633';

const COLOR_PALETTE = {
  red: 'rgba(254, 74, 73, 0.7)',
  green: 'rgba(55, 175, 85, 0.5)',
  blue: 'rgba(42, 183, 202, 0.6)',
};

/**
 * Map of Wunderground API weather condition states to weather icon class names.
 *
 * Icons: https://erikflowers.github.io/weather-icons
 */
const WEATHER_ICON_MAP = {
  clear: 'wi-day-sunny',
  partlycloudy: 'wi-day-cloudy',
  mostlycloudy: 'wi-cloudy',
  cloudy: 'wi-day-cloudy',
  fog: 'wi-fog',
  sleet: 'wi-sleet',
  snow: 'wi-snow',
  rain: 'wi-rain',
  tstorms: 'wi-thunderstorm'
};

// console.clear(); // JUST FOR DEBUGGING

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
      error: null,
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
      responseData: {}, // for testing and debugging only
    }
  },

  watch: {
    locale: function () {
      console.debug('');
      console.debug('LOCALE changed', this.locale);

      let id = `${this.locale}`;
      let apiUrl = `${API_PREFIX}/conditions/q/${this.locale}.json`;
      let wxData = this.getData(id);

      this.updateUI(id);
      this.sendGoogleAnalyticsEvent('update', this.locale);
    },

    geoCoordinates(value) {
      this.updateUI(value.zip_code);
    }
  },

  methods: {
    getWxData(url) {
      return axios.get(url);
    },

    getElapsedMinutes(epochNow, epochBefore) {
      let elapsedSeconds = epochNow - epochBefore;

      return elapsedSeconds / 60;
    },

    updateUI(locale) {
      let id = `${locale}`;
      let apiEndpoint = `${API_PREFIX}/conditions/hourly/q/${id}.json`;
      let wxData = this.getData(id);

      if (!wxData) {
        this.getWxData(apiEndpoint)
          .then(this.setData.bind(this, id))
          .then(() => {
            console.debug('No data to start, but data has been fetched and set now!');

            this.getHourlyForecastData(this.wx);
          });

      } else {
        let savedWxData = JSON.parse(wxData);
        let epochNow = moment().unix();
        let elapsedMinutes = this.getElapsedMinutes(epochNow, savedWxData.checkedAt.epoch);

        // Only get new weather data every 10 minutes
        if (elapsedMinutes >= 10) {
          console.debug('Fetching new weather data...');

          this.getWxData(apiEndpoint)
            .then(this.setData.bind(this, id))
            .then(() => {
              console.debug('Data has been set!');

              this.getHourlyForecastData(this.wx);
            });
        } else {
          this.wx = JSON.parse(wxData);

          this.getHourlyForecastData(this.wx);
        }
      }

      // console.debug('');
      // console.debug('----------------');
      // console.debug('this.WX', this.wx);
      // console.debug('----------------');
      // console.debug('');

      this.responseData = this.wx;
    },

    setData(id, res) {
      console.debug('Setting res... ', res);

      if (res.data.response && res.data.response.error) {
        return this.error = res.data.response.error;
      }

      this.error = null;

      let currentConditions = res.data.current_observation;
      let hrlyForecast = res.data.hourly_forecast;

      this.icon = WEATHER_ICON_MAP[currentConditions.icon_url];

      this.wx = {
        id: id,
        station: {
          id: currentConditions.station_id,
          city: currentConditions.observation_location.city,
          state: currentConditions.observation_location.state,
          country: currentConditions.observation_location.country,
          full: currentConditions.observation_location.full,
          elevation: currentConditions.observation_location.elevation,
          latitude: currentConditions.observation_location.latitude,
          longitude: currentConditions.observation_location.latitude,
        },
        location: {
          city: currentConditions.display_location.city,
          state: currentConditions.display_location.state,
          country: currentConditions.display_location.country,
          elevation: currentConditions.display_location.elevation,
          fullName: currentConditions.display_location.full,
          latitude: currentConditions.display_location.latitude,
          longitude: currentConditions.display_location.longitude,
          zip: currentConditions.display_location.zip,
        },
        updatedAt: {
          epoch: currentConditions.observation_epoch,
          date: new Date(currentConditions.observation_epoch * 1000),
          timestamp: currentConditions.observation_epoch * 1000
        },
        checkedAt: {
          epoch: moment().unix()
        },
        weather: currentConditions.weather,
        temp: {
          c: currentConditions.temp_c,
          f: currentConditions.temp_f,
          k: currentConditions.temp_c + 273.15 // Kelvin
        },
        dewpoint: {
          c: currentConditions.dewpoint_c,
          f: currentConditions.dewpoint_f
        },
        relativeHumidity: currentConditions.relative_humidity,
        heatIndex: {
          c: currentConditions.heat_index_c,
          f: currentConditions.heat_index_f
        },
        uv: currentConditions.uv,
        icon: currentConditions.icon,
        wxIcon: WEATHER_ICON_MAP[currentConditions.icon],
        forecast: {
          hourly: hrlyForecast
        }
      };

      this.storeData(this.wx.id, this.wx);
    },

    storeData(id, data) {
      console.debug('Storing data...', id);

      localStorage.setItem(id, JSON.stringify(data));
    },

    getData(id) {
      return localStorage.getItem(id);
    },

    getHourlyForecastData(wxData) {
      let mappedData = _.map(wxData.forecast.hourly, (hourlyData) => {
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

      let humidity = _.map(this.forecast.hourly, 'relativeHumidity');
      humidity.length = 12;

      this.chartDatasets = [
        {
          id: 'temp',
          label: 'Temp',
          fill: false,
          data: temps,
          borderColor: COLOR_PALETTE.red,
          pointRadius: 2,
          pointHitRadius: 5,
          pointBackgroundColor: COLOR_PALETTE.red,
          pointHoverBackgroundColor: COLOR_PALETTE.red,
          pointHoverBorderColor: COLOR_PALETTE.red
        },
        {
          id: 'humidity',
          label: 'Humidity',
          fill: false,
          data: humidity,
          borderColor: COLOR_PALETTE.green,
          pointRadius: 2,
          pointHitRadius: 5,
          pointBackgroundColor: COLOR_PALETTE.green,
          pointHoverBackgroundColor: COLOR_PALETTE.green,
          pointHoverBorderColor: COLOR_PALETTE.green
        },
      ];

      let hourlyTimes = this.extractDates(this.forecast.hourly);

      hourlyTimes.length = 12;

      this.setLabels(hourlyTimes);
      this.setDatasets(this.chartDatasets);
      this.renderChart(true);
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
      if (update) {
        this.chartHourly.update();
      } else {
        this.chartHourly.render();
      }
    },

    clearLocalStorage() {
      localStorage.clear();
    },

    sendGoogleAnalyticsEvent(action, value) {
      action = action || 'update';
      value = typeof value === 'string' ? value.toLowerCase() : value;

      ga('send', 'event', 'current conditions', action, value, {
        nonInteraction: false
      });
    }
  },

  beforeCreate() {
    let geoLocationApiUrl = 'http://freegeoip.net/json/';

    axios.get(geoLocationApiUrl).then((res) => {
      this.geoCoordinates = res.data;
    });
  },

  created: function () {
    // console.debug('created...');
  },

  mounted() {
    this.canvasElement = this.$el.querySelector('canvas');

    this.chartHourly = new Chart(this.canvasElement, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: this.chartDatasets
      },
      options: {
        tooltips: {
          displayColors: false,
          callbacks: {
            title: function (tooltipItem, data) {
              // console.debug('Tooltip data:', data);

              return null;
            }
          }
        },
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              padding: 5,
            },
            gridLines: {
              drawTicks: false
            }
          }],
          xAxes: [{
            ticks: {
              padding: 0,
              mirror: false,
              maxRotation: 0,
              fontSize: 10.5,
              callback: function (value, index, values) {
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
.weather {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.city {
  font-size: 1.5rem;
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
  max-height: 160px;
  width: 90vw;
  margin-bottom: 3rem;

  canvas {
    height: inherit;
    width: inherit;
  }
}
</style>
