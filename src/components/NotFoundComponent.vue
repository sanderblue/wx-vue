<template>
  <div class="error-page text-center">
    <h2>404</h2>
    <div class="error-404 text-center">Wups, we couldn't find that page.</div>
  </div>
</template>

<script>
  export default {
    name: 'not-found',

    data() {
      return {};
    }
  };
</script>

<style scoped>
  .error-page {
    padding: 1rem;
  }

  .error-404 {
    padding: 1rem;
  }
</style>
