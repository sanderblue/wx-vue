<template>
  <div id="app">
    <!-- <h1>WxVue</h1> -->
    <chart></chart>
  </div>
</template>


<script>
import Chart from './components/ChartVue';

export default {
  name: 'app',
  components: {
    'chart': Chart
  }
};
</script>

<style lang="scss">
  @import './styles/app';
</style>
