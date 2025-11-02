<template>
  <div>
    <Sidebar />
    <Header />

    <div class="app">
      <RouterView class="container-fluid" />
    </div>

    <!-- ko if: modal -->
    <!-- ko template: { name: templateChooser, data: modal } -->
    <!-- /ko -->
    <!-- /ko -->
  </diV>
</template>

<script setup>
defineOptions({
    name: 'App',
});

const props = defineProps(['server']);
</script>

<style>
.app {
  margin-top: 15px;
  margin-left: var(--sidebar-width);

  .container-fluid {
    padding-left: 40px;
    padding-right: 40px;
  }
}
</style>