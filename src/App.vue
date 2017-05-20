<template>
  <div>

    <header class="row header">
      <div class="small-4 wx-title">WxVue</div>
      <div class="small-8">
        <form class="header-form">
          <div class="input-group">
            <input v-on:keyup="search" v-on:blur="onBlurSearch" v-model="userLocation" class="input-group-field" type="text" placeholder="City, State or Zip code">

            <div class="input-group-button">
              <button class="button" v-on:click="onClickSubmit">
                <i class="fa fa-search"></i>
              </button>
            </div>

            <ul v-show="hasItems" class="aq-results">
              <li v-for="item in searchResults">
                <div v-text="item.name" v-on:click.prevent="onClickSearchResult" v-bind:data-zmw="item.zmw"></div>
              </li>
            </ul>
          </div>
        </form>
      </div>
      <div class="small-4 text-right">
        <button class="menu-icon" type="button" data-open="wx-menu"></button>
      </div>
    </header>

    <div class="off-canvas position-right" id="wx-menu" data-off-canvas>
      <ul class="menu vertical">
        <li><a href="#">Radar</a></li>
        <li><a href="#">History Data</a></li>
      </ul>
    </div>

    <main class="row small-16 columns small-centered" role="main">
      <div class="main-content">
        <currentconditions :locale="locale"></currentconditions>
      </div>
    </main>

    <footer></footer>
  </div>
</template>


<script>
import _ from 'lodash';
import jsonp from 'jsonp';
import CurrentConditions from './components/CurrentConditions';

const autoCompleteApiPrefix = 'http://autocomplete.wunderground.com/aq?h=0&query=';

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
    };
  },

  methods: {
    onClickSubmit(e) {
      e.preventDefault();

      console.debug('SUBMIT', this.userLocation);

      this.locale = this.userLocation;
    },

    onClickSearchResult(e) {
      let id = e.currentTarget.dataset.zmw;

      console.debug('CLICK SEARCH RESULT', id);

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
      // console.debug('Search event', e);

      if (!e.target.value || !e.target.value.length) {
        // console.debug('NO RESULTS', e.target.value);

        this.searchResults = [];
        return;
      }

      let queryEncoded = encodeURIComponent(e.target.value);
      let aqUrl = `${autoCompleteApiPrefix}${queryEncoded}`;
      let jsonpOptions = {
        param: 'cb',
      };

      jsonp(aqUrl, jsonpOptions, function (err, data) {
        // console.debug('HOLY SMOKES', data.RESULTS);

        this.searchResults = data.RESULTS;
      }.bind(this));
    }, 150)
  },

  mounted() {
    $(document).foundation();
  },

  computed: {
    hasItems() {
      return this.searchResults.length > 0;
    }
  },
};
</script>

<style lang="scss">
  @import './styles/app';

  .main-content {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

</style>
