import Vue from 'vue';
import Router from 'vue-router';
import LineChart from '@/components/LineChart';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'LineChart',
      component: LineChart,
    },
  ],
});
