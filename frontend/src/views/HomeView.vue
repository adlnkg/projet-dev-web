<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import SectionQuiSommesNous from '../components/SectionQuiSommesNous.vue'
import SectionFormations from '../components/SectionFormations.vue'
import SectionEvenements from '../components/SectionEvenements.vue'
import SectionActualites from '../components/SectionActualites.vue'
import SectionObjets from '../components/SectionObjets.vue'

const router = useRouter()

const actuCount = ref(0)
const eventCount = ref(0)
const deviceCount = ref(0)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/home')
    const data = await response.json()
    if (data.success) {
      actuCount.value = data?.data?.actuCount || 0
      eventCount.value = data?.data?.eventCount || 0
      deviceCount.value = data?.data?.deviceCount || 0
    }
  } catch (e) {
    
    // silently ignore and log to console, since these counts are not critical for the page to function
    console.error('Erreur lors du chargement des statistiques du home:', e)
  }
})
</script>

<template>
  <div>
    <HeroSection :actuCount="actuCount" :eventCount="eventCount" :deviceCount="deviceCount" />
    <SectionQuiSommesNous />
    <SectionFormations />
    <SectionObjets />
    <SectionActualites />
    <SectionEvenements />
  </div>
</template>

<style scoped>
</style>
