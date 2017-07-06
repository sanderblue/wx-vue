<template>
  <div>
    <header class="row expanded header">
      <div class="small-3 large-6 wx-title">WxVue</div>
      <div class="small-10 large-4">
        <form class="header-form" v-on:submit="onSubmitSearch">
          <div class="input-group">
            <input v-on:keyup.passive="search" v-on:blur.passive="onBlurSearch" v-model="userLocation" class="input-group-field" type="text" placeholder="City, State or Zip">
            <div class="input-group-button">
              <button type="button" class="button" v-on:click="onClickSubmit">
                <i class="fa fa-search"></i>
              </button>
            </div>
            <ul v-show="hasItems" class="aq-results">
              <li v-for="item in searchResults">
                <div v-text="item.name" v-on:click.passive="onClickSearchResult" v-bind:data-q="item.l">
                </div>
              </li>
            </ul>
          </div>
        </form>
      </div>
      <div class="small-3 large-6 text-right">
        <button id="open-menu" class="menu-icon" type="button" data-open="wx-menu" v-on:click.passive="openMenu"></button>
        <button id="close-menu" class="menu-icon hide" type="button" data-close="wx-menu" v-on:click.passive="closeMenu"></button>
      </div>
    </header>

    <main class="" role="main">
      <div class="main-content large-8 small-centered">
        <currentconditions :locale="locale"></currentconditions>
      </div>
    </main>

    <footer>Test</footer>

    <div class="off-canvas position-right" id="wx-menu" data-off-canvas data-auto-focus="false">
      <div class="mobile-menu-container">
        <ul class="menu vertical">
          <!-- <li><a href="#">Radar</a></li> -->
          <!-- <li><a href="#">History Data</a></li> -->
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
const AUTOCOMPLETE_API_PREFIX = 'http://autocomplete.wunderground.com/aq?h=0&query=';

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
      apiRefId: 'a0fa16fd450326fa'
    };
  },

  computed: {
    hasItems() {
      return this.searchResults.length > 0;
    },

    apiRefUrl() {
      return `https://www.wunderground.com/?apiref=${this.apiRefId}`;
    }
  },

  methods: {
    openMenu() {
      document.getElementById('open-menu').classList.add('hide');
      document.getElementById('close-menu').classList.remove('hide');
    },

    closeMenu() {
      document.getElementById('close-menu').classList.add('hide');
      document.getElementById('open-menu').classList.remove('hide');
    },

    onSubmitSearch(e) {
      e.preventDefault();

      this.userLocation = _.trim(this.userLocation);

      console.log('Search Submit:', this.userLocation);

      if (this.userLocation !== '') {
        this.locale = this.userLocation;
      }

      this.searchResults = [];

      this.userLocation = '';

      let gaValue = typeof this.locale === 'string' ? this.locale.toLowerCase() : this.locale;

      ga('send', 'event', 'search', 'submit', gaValue, {
        nonInteraction: false
      });
    },

    onClickSubmit(e) {
      e.preventDefault();

      this.userLocation = _.trim(this.userLocation);

      if (this.userLocation !== '') {
        this.locale = this.userLocation;
      }

      let gaValue = typeof this.locale === 'string' ? this.locale.toLowerCase() : this.locale;

      ga('send', 'event', 'search', 'submit', gaValue, {
        nonInteraction: false
      });
    },

    onClickSearchResult(e) {
      this.locale = e.currentTarget.dataset.q; // Using the Wunderground prebuilt query path `/q/${result}``
      this.searchResults = [];
      this.userLocation = '';

      let gaValue = typeof this.locale === 'string' ? this.locale.toLowerCase() : this.locale;

      ga('send', 'event', 'search', 'click autocomplete', gaValue, {
        nonInteraction: false
      });
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
      let aqUrl = `${AUTOCOMPLETE_API_PREFIX}${queryEncoded}`;
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
  }
};
</script>

<style lang="scss">
  @import "./styles/app";
</style>
