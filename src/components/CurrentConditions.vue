<template>
  <div class="current-conditions">
    <div class="small-5 columns text-center">
      <i class="wx-icon wi" v-bind:class="[wx.wxIcon]"></i>
      <div class="weather">{{ wx.weather }}</div>
    </div>
    <div class="small-7 columns">
      <div class="temp">{{ wx.temp.f }}&deg;</div>
      <div>
        <span class="wx-label">Humidity:</span>
        <span>{{ wx.relativeHumidity }}</span>
      </div>
      <div>
        <span class="wx-label">Dewpoint:</span>
        <span>{{ wx.dewpoint.f }}&deg;</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'

console.clear();

const apiPrefix = 'http://api.wunderground.com/api/1e0a7bd45ab35633';

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
      }
    }
  },

  watch: {
    geoCoordinates(value) {

      // console.debug('geoCoordinates changed!', value.latitude);

      let currentConditionsUrl = `${apiPrefix}/conditions/q/${value.latitude},${value.longitude}.json`;

      axios.get(currentConditionsUrl).then((res) => {
        let data = res.data.current_observation;

        console.debug('Current Conditions...', data);

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

        console.debug('this.wx:', this.wx.icon);
      });
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
    // console.debug('mounted...')
  }
}
</script>

<style scoped>

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

.temp {
  font-size: 3rem;
  font-weight: 600;
}

.wx-label {
  font-weight: 600;
}
</style>
