<script setup>
import NavBar from './components/NavBar.vue'
import SectionFooter from './components/SectionFooter.vue'
import { RouterView } from "vue-router";
</script>

<template>
  <div id="page">
    <NavBar />
    <div id="content">
      <RouterView />
    </div>
  </div>
  <SectionFooter />
</template>

<style scoped>
#page {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100dvh;
}
#content {
  position: relative;
}
</style>
