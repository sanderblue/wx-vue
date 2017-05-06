<template>
  <div class="chart-container">
    <label for="zip">Zip Code</label>
    <input id="zip" type="text" name="zip">
    <canvas class="chart"></canvas>
  </div>
</template>


<script>
import Chart from 'chart.js'

console.clear()
console.log('')

/* eslint-disable no-new */
export default {
  name: 'chart',

  data() {
    return {

    }
  },

  beforeCreate() {
    console.debug('beforeCreate...', this);
  },

  created: function () {
    console.debug('created...     ', this);
  },

  mounted() {
    console.debug('mounted...     ', this)

    let canvasElement = this.$el.querySelector('canvas');

    // init chart.js
    let chart = new Chart(canvasElement, {
      type: 'line',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    })

    chart.render();
  }
}
</script>

<style type="text/css" scoped>
  .chart {
    height: 200px;
    width: 320px;
    margin: 0 auto;
  }
</style>
