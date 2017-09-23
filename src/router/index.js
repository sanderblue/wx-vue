import Vue from 'vue';
import Router from 'vue-router';
import NotFoundComponent from '@/components/NotFoundComponent';
import CurrentConditions from '@/components/CurrentConditions';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '*',
      component: NotFoundComponent
    },
    {
      path: '/',
      component: CurrentConditions
    },
    {
      path: '/q/:locale',
      component: CurrentConditions,
      props: true
    },
  ]
});
