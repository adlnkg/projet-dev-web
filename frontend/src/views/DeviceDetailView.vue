<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMe } from '../utils/user'

const route = useRoute()
const router = useRouter()
const device = ref(null)
const loading = ref(true)
const error = ref('')
const deletionLoading = ref(false)
const deletionMessage = ref('')
const currentUserRole = ref('')

const imageUrl = computed(() => {
  const value = device.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80'
})

async function loadDevice() {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise pour accéder aux objets connectés.')

    const res = await fetch(`http://localhost:3000/api/devices/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || 'Objet introuvable')
    device.value = data.data
  } catch (e) {
    error.value = e.message || 'Impossible de charger cet objet connecté.'
  } finally {
    loading.value = false
  }
}

async function requestDeletion() {
  deletionLoading.value = true
  deletionMessage.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise.')
    if (!confirm('Envoyer une demande de suppression de cet objet connecté à un administrateur ?')) return

    const res = await fetch(`http://localhost:3000/api/devices/${route.params.id}/deletion-request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Demande impossible')
    deletionMessage.value = 'Demande envoyée aux administrateurs.'
  } catch (e) {
    deletionMessage.value = e.message || 'Erreur lors de la demande.'
  } finally {
    deletionLoading.value = false
  }
}

onMounted(loadDevice)
onMounted(async () => {
  try {
    const me = await getMe()
    currentUserRole.value = me.role || ''
  } catch (_) {}
})
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.push('/recherche?category=device')">← Retour aux objets</button>

    <div v-if="loading" class="state-card">Chargement de l'objet connecté...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="device" class="detail-card">
      <div class="hero">
        <img :src="imageUrl" :alt="device.name" class="hero-img" />
        <div class="hero-overlay">
          <button
            v-if="currentUserRole === 'SUPER_USER' || currentUserRole === 'ADMIN'"
            class="delete-request-btn"
            :disabled="deletionLoading"
            @click="requestDeletion"
            title="Demander la suppression"
          >
            ✕
          </button>
          <h1>{{ device.name }}</h1>
          <p v-if="device.type" class="subtitle">Type : {{ device.type }}</p>
          <p v-if="deletionMessage" class="action-message">{{ deletionMessage }}</p>
        </div>
      </div>

      <section class="content-panel">
        <h2>Description</h2>
        <p>{{ device.description || 'Aucune description disponible.' }}</p>
      </section>
    </article>
  </main>
</template>

<style scoped>
.page-container { max-width: 980px; margin: 0 auto; padding: 2rem; }
.back-btn { background: transparent; border: none; color: #1a5c9e; font-weight: 700; cursor: pointer; margin-bottom: 1rem; }
.state-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; color: #555; }
.state-card.error { color: #b91c1c; background: #fef2f2; }
.detail-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
.hero { position: relative; }
.hero-img { width: 100%; max-height: 360px; object-fit: cover; display: block; }
.hero-overlay { position: absolute; inset: auto 0 0 0; background: linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,0)); color: white; padding: 2rem; }
.hero-overlay h1 { margin: 0; }
.subtitle { margin-top: .5rem; color: #d6e8f7; }
.content-panel { padding: 1.5rem; }
.delete-request-btn { position: absolute; right: 1rem; top: 1rem; width: 36px; height: 36px; border-radius: 999px; border: 1px solid rgba(255,255,255,.8); background: rgba(220,38,38,.8); color: white; cursor: pointer; font-size: 1.2rem; font-weight: 800; }
.action-message { margin-top: .75rem; }
</style>