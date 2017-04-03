<template>
  <div class="container">
    <div id="line-chart"></div>
  </div>
</template>

<script>
import LineExample from './components/LineChart.js';

export default {
  name: 'app',
  components: {
    LineExample,
  },
};
</script>

<style>
.container {
  max-width: 800px;
  height: 350px;
  margin: 0 auto;
}
</style>
