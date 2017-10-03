<template>
  <div class="current-conditions">
    <div v-if="error" class="text-center">
      <strong>{{ error.description }}</strong>
    </div>
    <div v-if="results.length">
      <li v-for="item in results">
        <router-link :to="item.l">
          <span v-text="item.city"></span>
          <span v-text="item.state"></span>
          <span v-text="item.country_name"></span>
        </router-link>
      </li>

      <ul>
        <li v-for="item in items">
          {{ item.message }}
        </li>
      </ul>
    </div>
    <div v-if="!error && !results.length">
      <div class="row weather-condition">
        <div class="small-16 columns text-center">
          <h3>{{ wx.location.full }}</h3>
          <i class="wx-icon wi" v-bind:class="[wx.wxIcon]"></i>
          <div class="weather-text">{{ wx.weather }}</div>
        </div>
      </div>
      <div class="row weather-details">
        <div class="small-8 columns temp-container">
          <div class="temp text-right clearfix">
            <span>{{ wx.temp.f }}</span>
            <i class="fa fa-circle-o degree-symbol float-right" aria-hidden="true"></i>
          </div>
          <div class="row forecast-high-low">
            <div class="small-16 columns text-right">
              <i class="fa fa-caret-down" aria-hidden="true"></i>
              <span class="low-temp">{{ wx.forecastToday.temp.low.f }}&deg;</span>
              <i class="fa fa-caret-up" aria-hidden="true"></i>
              <span class="high-temp">{{ wx.forecastToday.temp.high.f }}&deg;</span>
            </div>
          </div>
        </div>
        <div class="small-8 columns details-container">
          <div class="wx-row">
            <span class="wx-label">Humidity:</span>
            <span>{{ wx.relativeHumidity }}</span>
          </div>
          <div class="wx-row">
            <span class="wx-label">Dewpoint:</span>
            <span>{{ wx.dewpoint.f }}&deg;</span>
          </div>
          <div class="wx-row">
            <span class="wx-label">Elevation:</span>
            <span>{{ wx.station.elevation }}</span>
          </div>
        </div>
      </div>
      <div class="row hourly-details">
        <div class="small-16 columns">
          <h4 class="text-center">12-hour Forecast</h4>
          <div class="chart-container">
            <canvas class="chart"></canvas>
          </div>
          <div class="chart-legend clearfix">
            <div class="float-right">
              <div class="legend-item">
                <div class="legend-line legend-temp"></div>
                <div class="legend-key">Temperature</div>
              </div>
              <div class="legend-item">
                <div class="legend-line legend-humidity"></div>
                <div class="legend-key">Humidity</div>
              </div>
            </div>
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
import ChartPlugins from '../modules/chart-plugins';
import ApiHelper from '../modules/api-helper';

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

console.clear(); // JUST FOR DEBUGGING

export default {
  props: [],

  data() {
    return {
      locale: '',
      results: [],
      chartLegendStyles: {
        temp: {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: COLOR_PALETTE.red,
        },
        humidity: {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: COLOR_PALETTE.green,
        }
      },
      geoCoordinates: {
        ip: null,
        country_code: 'US',
        country_name: 'United States',
        region_code: 'OR',
        region_name: 'Oregon',
        city: 'Portland',
        zip_code: '97223',
        time_zone: 'America/Los_Angeles',
        latitude: 45.447,
        longitude: -122.7668,
        metro_code: 820
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
          full: '',
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
        wxIcon: null,
        forecastToday: {
          temp: {
            high: {
              f: '',
              c: ''
            },
            low: {
              f: '',
              c: ''
            },
          }
        }
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

  /**
   * Handles when the destination is the same as the current route
   * and only params are changing (e.g. /users/1 -> /users/2).
   *
   * @param  {Object}   toRoute
   * @param  {Object}   fromRoute
   * @param  {Function} next
   * @return {void}
   */
  beforeRouteUpdate (toRoute, fromRoute, next) {
    if (this.$route.params.locale) {
      this.locale = toRoute.params.locale;
    }

    next();
  },

  beforeCreate() {
    // console.log('Current Conditions component BEFORECREATE', this.$route);
  },

  created() {
    console.log('Conditions component CREATED', this.$route);

    if (this.$route.params.locale) {
      this.locale = this.$route.params.locale;
    } else {
      this.triggerIpLocationLookup();
    }
  },

  mounted() {
    console.log('Conditions component MOUNTED');

    this.canvasElement = this.$el.querySelector('canvas');

    this.chartHourly = new Chart(this.canvasElement, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: this.chartDatasets
      },
      options: {
        showAllTooltips: true,
        tooltips: {
          displayColors: false,
          callbacks: {
            title: function (tooltipItem, data) {
              return null;
            },

            label: function (tooltipItem, data) {
              return tooltipItem.yLabel;
            },
          },
          backgroundColor: 'rgba(0,0,0,0)',
          bodyFontSize: 10,
          bodyFontColor: 'rgba(0,0,0, 0.6)',
          bodySpacing: 0,
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
  },

  watch: {
    locale() {
      console.debug('Locale:', this.locale);

      this.updateUI(`/q/${this.locale}`);
      this.sendGoogleAnalyticsEvent('locale', this.locale);
    },

    geoCoordinates(data) {
      console.log('geoCoordinates:', data);

      let uriParam = data.zip_code ? ApiHelper.createZipCodeUriParam(data) : ApiHelper.createLatitudeLongitudeUriParam(data);

      this.updateUI(`/q/${uriParam}`);
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
      let apiEndpoint = `${API_PREFIX}/conditions/forecast/hourly${id}.json`;
      let wxData = this.getData(id);

      if (!wxData) {
        this.getWxData(apiEndpoint)
          .then((res) => {
            console.log('Response:', res.data);

            if (res.data.response.results && res.data.response.results.length) {
              this.results = res.data.response.results;
            } else {
              this.setData.call(this, id);
            }
          })
          .then(() => {
            this.getHourlyForecastData(this.wx);
          });

      } else {
        let savedWxData = JSON.parse(wxData);
        let epochNow = moment().unix();
        let elapsedMinutes = this.getElapsedMinutes(epochNow, savedWxData.checkedAt.epoch);

        // Only get new weather data every 10 minutes
        if (elapsedMinutes >= 10) {
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

      this.responseData = this.wx;

      console.log('WX DATA:', this.wx);
    },

    setData(id, res) {
      console.log('Setting res... ', res);

      if (res.data.response && res.data.response.error) {
        return this.error = res.data.response.error;
      }

      this.error = null;

      let currentConditions = res.data.current_observation;
      let hrlyForecast = res.data.hourly_forecast;
      let forecastToday = res.data.forecast.simpleforecast.forecastday[0];

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
          full: currentConditions.display_location.full,
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
        },
        visibility: {
          mi: currentConditions.visibility_mi,
          km: currentConditions.visibility_km
        },
        wind: {
          degrees: currentConditions.wind_degrees,
          direction: currentConditions.wind_dir,
          mph: currentConditions.wind_mph,
          kph: currentConditions.wind_kph
        },
        forecastToday: {
          temp: {
            high: {
              f: forecastToday.high.fahrenheit,
              c: forecastToday.high.celsius
            },
            low: {
              f: forecastToday.low.fahrenheit,
              c: forecastToday.low.celsius
            }
          }
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
    },

    triggerIpLocationLookup() {
      let geoLocationApiUrl = 'http://freegeoip.net/json/';

      axios.get(geoLocationApiUrl)
        .then((res) => {
          console.log('ApiHelper.isSafeResponseForUriCreation(res)', ApiHelper.isSafeResponseForUriCreation(res));

          if (ApiHelper.isSafeResponseForUriCreation(res)) {
            let latLongParam = ApiHelper.createLatitudeLongitudeUriParam(res.data);

            this.$router.replace(`/q/${latLongParam}`);

            this.geoCoordinates = res.data;
          } else {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  // this.geoCoordinates = position.coords;

                  let latLongParam = ApiHelper.createLatitudeLongitudeUriParam(position);

                  this.$router.push(`/q/${latLongParam}`);
                },
                (error) => {
                  console.warn(error.message);
                }
              );
            }
          }
        })
        .catch((error) => {
          console.warn('An error occurred attempting to use freegeoip.net for location services. Using default geolocation value instead.');

          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('\n\n\n');
            console.log('error.response.data', error.response.data);
            console.log('error.response.status', error.response.status);
            console.log('error.response.headers', error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log('error.request', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('error.message', error.message);
          }

          console.log('error.config:', error.config);
          console.log('\n\n\n');

          this.geoCoordinates = {
            ip: '127.0.0.1',
            country_code: 'US',
            country_name: 'United States',
            region_code: 'OR',
            region_name: 'Oregon',
            city: 'Portland',
            zip_code: '97223',
            time_zone: 'America/Los_Angeles',
            latitude: 45.447,
            longitude: -122.7668,
            metro_code: 820
          };
        })
      ;
    }
  },

  initializeChartPlugins() {
    ChartPlugins.initializeCustomTooltips();
  }
}
</script>

<style scoped>
.weather-text {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 1.25rem;
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
  font-size: 0.9375rem;
}

.wx-label {
  font-weight: 600;
  display: inline-block;
  min-width: 5rem;

  + span {
    display: inline-block;
  }
}

.hourly-details {
  margin-top: 2rem;
}

.chart-container {
  height: 20vh;
  max-height: 160px;
  width: 90vw;
  margin-bottom: 1rem;

  canvas {
    height: inherit;
    width: inherit;
  }
}

.chart-legend {
  display: block;
}

.legend-item {
  display: block;
}

.legend-line {
  height: 2px;
  width: 2rem;
  border-bottom-width: 2px;
  border-bottom-style: solid;
}

.legend-temp {
  border-bottom-color: rgba(254, 74, 73, 0.7);
}

.legend-humidity {
  border-bottom-color: rgba(55, 175, 85, 0.5);
}

.legend-line,
.legend-key {
  display: inline-block;
  vertical-align: middle;
}
</style>
