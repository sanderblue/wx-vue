<template>
  <div>

    <header class="row header">
      <div class="small-3 wx-title">WxVue</div>
      <div class="small-6">
        <search></search>
      </div>
      <div class="small-3 text-right">
        <button class="menu-icon" type="button" data-open="wx-menu"></button>
      </div>
    </header>

    <div class="off-canvas position-right" id="wx-menu" data-off-canvas>
      <ul class="menu vertical">
        <li><a href="#">Radar</a></li>
        <li><a href="#">History Data</a></li>
      </ul>
    </div>

    <main class="row small-12 columns small-centered" role="main">
      <div class="main-content">
        <currentconditions></currentconditions>
      </div>
    </main>

    <footer></footer>
  </div>
</template>


<script>
import Search from './components/Search';
import CurrentConditions from './components/CurrentConditions';

export default {
  name: 'app',
  components: {
    'search': Search,
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
