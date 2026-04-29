<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const actuality = ref(null)
const loading = ref(true)
const error = ref(null)

const imageUrl = computed(() => {
  const value = actuality.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80'
})

function goToProfile(login) {
  if (!login) return
  router.push(`/profile/${login}`)
}

function formatDate(value) {
  if (!value) return 'Date inconnue'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function loadActuality() {
  try {
    const res = await fetch(`http://localhost:3000/api/actualities/${route.params.id}`)
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Actualité introuvable')
    }
    actuality.value = data.data
  } catch (e) {
    error.value = e.message || 'Impossible de charger l’actualité.'
  } finally {
    loading.value = false
  }
}

onMounted(loadActuality)
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.push('/actualites')">← Retour aux actualités</button>

    <div v-if="loading" class="state-card">Chargement de l’actualité...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="actuality" class="detail-card">
      <div class="hero">
        <img :src="imageUrl" :alt="actuality.title" class="hero-img" />
        <div class="hero-overlay">
          <div class="meta-row">
            <span v-if="actuality.type" class="pill">{{ actuality.type }}</span>
            <span class="date">{{ formatDate(actuality.createdAt) }}</span>
          </div>
          <h1>{{ actuality.title }}</h1>
          <p
            v-if="actuality.ownerName || actuality.owner?.login"
            class="author author-link"
            @click="goToProfile(actuality.owner?.login || actuality.ownerName)"
          >
            Par {{ actuality.owner?.firstName || actuality.ownerName || actuality.owner?.login }}
          </p>
        </div>
      </div>

      <div class="content-grid">
        <section class="content-panel">
          <h2>Contenu</h2>
          <p class="content-text">{{ actuality.content }}</p>
        </section>

        <aside class="side-panel">
          <h3>Informations</h3>
          <div class="info-item">
            <span>Publié le</span>
            <strong>{{ formatDate(actuality.createdAt) }}</strong>
          </div>
          <div class="info-item" v-if="actuality.owner?.login || actuality.ownerName">
            <span>Auteur</span>
            <strong>{{ actuality.owner?.firstName || actuality.ownerName || actuality.owner?.login }}</strong>
          </div>
          <div class="info-item" v-if="actuality.specific && Object.keys(actuality.specific).length > 0">
            <span>Détails complémentaires</span>
            <pre>{{ JSON.stringify(actuality.specific, null, 2) }}</pre>
          </div>
        </aside>
      </div>
    </article>
  </main>
</template>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.back-btn {
  background: transparent;
  border: none;
  color: #1a5c9e;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 1rem;
}

.state-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  color: #555;
}

.state-card.error {
  color: #b91c1c;
  background: #fef2f2;
}

.detail-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(13, 45, 94, 0.08);
}

.hero {
  position: relative;
}

.hero-img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: auto 0 0 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0));
  color: white;
  padding: 2rem;
}

.meta-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.pill {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.date,
.author {
  color: #d6e8f7;
  font-size: 13px;
}

.author-link {
  display: inline-flex;
  width: fit-content;
  cursor: pointer;
}

.hero-overlay h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
}

.content-panel,
.side-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
}

.content-panel h2,
.side-panel h3 {
  margin: 0 0 1rem;
  color: #0d2d5e;
}

.content-text {
  white-space: pre-line;
  line-height: 1.7;
  color: #444;
}

.info-item {
  display: grid;
  gap: 0.25rem;
  padding: 0.85rem 0;
  border-top: 1px solid #f0f0f0;
}

.info-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.info-item span {
  font-size: 12px;
  color: #777;
}

.info-item strong {
  color: #0d2d5e;
}

.info-item pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  color: #555;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 10px;
  overflow: auto;
}

@media (max-width: 900px) {
  .page-container {
    padding: 1rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-overlay h1 {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .hero-overlay {
    padding: 1rem;
  }

  .hero-overlay h1 {
    font-size: 22px;
  }

  .content-grid {
    padding: 1rem;
  }
}
</style>
