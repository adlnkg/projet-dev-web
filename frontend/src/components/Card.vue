<script setup>
const props = defineProps({
  floating: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="card" :class="{ floating }">
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 24px;
}
.card.floating {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px;
}
</style>
