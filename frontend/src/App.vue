<script setup>
import NavBar from './components/NavBar.vue'
import SectionFooter from './components/SectionFooter.vue'
import { RouterView } from "vue-router";
</script>

<template>
  <div id="page">
    <NavBar />
    <RouterView />
  </div>
  <SectionFooter />
</template>

<style scoped>
#page {
  position: relative;
  min-height: 100dvh;
}
</style>
