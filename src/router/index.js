import Vue from 'vue';
import Router from 'vue-router';
import CurrentConditions from '@/components/CurrentConditions';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CurrentConditions',
      component: CurrentConditions
    }
  ]
});
