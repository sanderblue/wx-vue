<template>
  <div class="main-content">
    <currentconditions></currentconditions>
  </div>
</template>


<script>
// import Chart from './components/ChartVue';
import CurrentConditions from './components/CurrentConditions';

export default {
  name: 'app',
  components: {
    // 'chart': Chart,
    'currentconditions': CurrentConditions
  },
  mounted() {
    $(document).foundation();
  }
};
</script>

<style lang="scss">
  @import './styles/app';

  .main-content {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

</style>
