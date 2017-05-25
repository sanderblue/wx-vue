<template>
  <div>

    <header class="row header">
      <div class="small-4 wx-title">WxVue</div>
      <div class="small-8">
        <form class="header-form" v-on:submit.passive="">
          <div class="input-group">
            <input v-on:keyup.passive="search" v-on:blur.passive="onBlurSearch" v-model="userLocation" class="input-group-field" type="text" placeholder="City, State or Zip code">

            <div class="input-group-button">
              <button type="button" class="button" v-on:click.passive="onClickSubmit">
                <i class="fa fa-search"></i>
              </button>
            </div>

            <ul v-show="hasItems" class="aq-results">
              <li v-for="item in searchResults">
                <div v-text="item.name" v-on:click.passive="onClickSearchResult" v-bind:data-zmw="item.zmw"></div>
              </li>
            </ul>
          </div>
        </form>
      </div>
      <div class="small-4 text-right">
        <button class="menu-icon" type="button" data-open="wx-menu"></button>
      </div>
    </header>

    <main class="" role="main">
      <div class="main-content">
        <currentconditions :locale="locale"></currentconditions>
      </div>
    </main>

    <footer class=>Test</footer>

    <div class="off-canvas position-right" id="wx-menu" data-off-canvas>
      <div class="mobile-menu-container">
        <ul class="menu vertical">
          <li><a href="#">Radar</a></li>
          <li><a href="#">History Data</a></li>
        </ul>
        <div class="mobile-menu-footer">
          <div class="built-by">
            <span>Built by</span>
            <a href="http://www.sanderblue.com" target="_blank">Sander Blue</a>
          </div>
          <div class="powered-by">
            <div>
              <span>Powered by</span>
              <a v-bind:href="apiRefUrl" target="_blank">Wunderground</a>
            </div>
            <a v-bind:href="apiRefUrl" target="_blank">
              <img src="./assets/images/wunderground/wundergroundLogo_horizontal_white_text_xsmall.png">
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import _ from 'lodash';
import jsonp from 'jsonp';
import CurrentConditions from './components/CurrentConditions';

/**
 * Utilizes jsonp and does not count against Wunderground API usage rates.
 *
 * @type {String}
 */
const autoCompleteApiPrefix = 'http://autocomplete.wunderground.com/aq?h=0&query=';

/**
 * App Component
 *
 * This is the main entry point of the app.
 */
export default {
  name: 'app',
  components: {
    'currentconditions': CurrentConditions
  },

  data() {
    return {
      userLocation: '',
      locale: '',
      searchResults: [],
      localStorageData: {}, // just for testing
      apiRefId: 'a0fa16fd450326fa'
    };
  },

  methods: {
    onClickSubmit(e) {
      // e.preventDefault();

      console.debug('SUBMIT', this.userLocation);

      this.locale = this.userLocation;
    },

    onClickSearchResult(e) {
      let id = e.currentTarget.dataset.zmw;

      // Might be able to directly use the data attribute instead
      // of searching through the results.
      let result = _.find(this.searchResults, (item) => {
        return item.zmw == id;
      });

      console.debug('Result', result);

      this.locale = result.zmw;

      this.searchResults = [];

      e.currentTarget.value = '';
    },

    onBlurSearch: _.debounce(function () {
      this.searchResults = [];
    }, 200),

    search: _.debounce(function (e) {
      if (!e.target.value || !e.target.value.length) {
        this.searchResults = [];
        return;
      }

      let queryEncoded = encodeURIComponent(e.target.value);
      let aqUrl = `${autoCompleteApiPrefix}${queryEncoded}`;
      let jsonpOptions = {
        param: 'cb',
      };

      jsonp(aqUrl, jsonpOptions, (err, data) => {
        this.searchResults = data.RESULTS;
      });
    }, 150)
  },

  mounted() {
    $(document).foundation();
  },

  computed: {
    hasItems() {
      return this.searchResults.length > 0;
    },

    apiRefUrl() {
      return `https://www.wunderground.com/?apiref=${this.apiRefId}`;
    }
  },
};
</script>

<style lang="scss">
  @import './styles/app';
</style>
