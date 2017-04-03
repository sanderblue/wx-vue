// import { Line } from 'vue-chartjs';
import Vue from 'vue';
import Chart from 'chart.js';

export default Vue.extend({

  mounted() {
    console.debug('Chart instance:', Chart);

    this.el = document.getElementById('line-chart');
    this.data = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: '#FC2525',
          data: [40, 39, 10, 40, 39, 80, 40],
        },
        {
          label: 'Data Two',
          backgroundColor: '#05CBE1',
          data: [60, 55, 32, 10, 2, 12, 53],
        },
      ],
    };

    this.chart = new Chart(this.el, {
        type: 'line',
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: true,
        },
      },
    );

    this.chart.generateLegend();

    // this.renderChart({
    //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //   datasets: [
    //     {
    //       label: 'Data One',
    //       backgroundColor: '#FC2525',
    //       data: [40, 39, 10, 40, 39, 80, 40],
    //     },
    //     {
    //       label: 'Data Two',
    //       backgroundColor: '#05CBE1',
    //       data: [60, 55, 32, 10, 2, 12, 53],
    //     },
    //   ],
    // }, {
    //   responsive: true,
    //   maintainAspectRatio: true,
    // });
  },
});
