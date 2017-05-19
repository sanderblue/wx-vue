<template>
  <div>

    <header class="row header">
      <div class="small-4 wx-title">WxVue</div>
      <div class="small-8">
        <form class="header-form">
          <div class="input-group">
            <input v-on:input="search" v-model="userLocation" class="input-group-field" type="text" placeholder="City, State or Zip code">

            <ul v-show="hasItems" class="aq-results">
              <li v-for="item in searchResults">
                <div v-text="item.name"></div>
              </li>
            </ul>

            <div class="input-group-button">
              <button class="button" v-on:click="onClickSubmit">
                <i class="fa fa-search"></i>
              </button>
            </div>
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
  methods: {
    onClickSubmit(e) {
      e.preventDefault();

      console.debug('SUBMIT', this.userLocation);

      this.locale = this.userLocation;
    },

    search: _.debounce(function (e) {
      console.debug('Search event', e.target.value);
      // console.debug('Search value', e.currentTarget.value);

      if (!e.target.value || !e.target.value.length) {
        console.debug('NO RESULTS', e.target.value);

        this.searchResults = [];
        return;
      }

      let queryEncoded = encodeURIComponent(e.target.value);
      let aqUrl = `${autoCompleteApiPrefix}${queryEncoded}`;
      let jsonpOptions = {
        param: 'cb',
      };

      jsonp(aqUrl, jsonpOptions, function (err, data) {
        console.debug('HOLY SMOKES', data.RESULTS);

        this.searchResults = data.RESULTS;
      }.bind(this));
    }, 250)
  },

  data() {
    return {
      userLocation: '',
      locale: '',
      searchResults: [],
    };
  },

  mounted() {
    $(document).foundation();
  },

  computed: {
    hasItems() {
      return this.searchResults.length > 0
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
