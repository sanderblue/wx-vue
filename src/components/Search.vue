<template>
  <form class="header-form">
    <div class="input-group">
      <input class="input-group-field" type="text" v-model="locale" placeholder="Zip code">
      <div class="input-group-button">
        <button class="button" v-on:click="onClickSubmit">
          <i class="fa fa-search"></i>
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'search',
  data() {
    return {
      locale: '',
    };
  },

  watch: {
    locale: function (value) {
      console.debug('Value', value);
    }
  },

  methods: {
    onClickSubmit(e) {
      e.preventDefault();

      console.debug('SUBMIT', e);

      this.$root.$emit('wx.search.submit', this.locale);
    }
  }
};

</script>
