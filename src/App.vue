<template>
  <div id="app">
    <h1>ChartVue</h1>
    <chart></chart>
  </div>
</template>


<script>
import Chart from './components/ChartVue'

export default {
  name: 'app',
  components: {
    'chart': Chart
  }
}
</script>
