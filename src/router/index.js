import Vue from 'vue';
import Router from 'vue-router';
import BaseComponent from '@/components/BaseComponent';
import CurrentConditions from '@/components/CurrentConditions';
import NotFoundComponent from '@/components/NotFoundComponent';

Vue.use(Router);

export default new Router({
  base: '/',
  // mode: 'history',
  routes: [
    {
      path: '/',
      component: CurrentConditions,
    },
    {
      path: '/q/:locale',
      component: CurrentConditions,
      props: true,
    },
    {
      path: '*',
      component: NotFoundComponent
    },
  ]
});
