<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(true)
const error = ref(null)
const actualites = ref([])
const evenements = ref([])

const quickStats = computed(() => [
  { label: 'Actualités', value: actualites.value.length },
  { label: 'Événements à venir', value: evenements.value.length },
  { label: 'Parcours ingénieur', value: 6 },
  { label: 'Objets connectés', value: 120 },
])

function getImageUrl(path, fallback) {
  if (!path) return fallback
  return `http://localhost:3000/${path}`
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function loadHomeData() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:3000/api/home')
    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Impossible de charger la page d’accueil')
    }

    actualites.value = data?.data?.actualities || []
    evenements.value = data?.data?.events || []
  } catch (e) {
    error.value = e.message || 'Erreur lors du chargement.'
  } finally {
    loading.value = false
  }
}

onMounted(loadHomeData)
</script>

<template>
  <div class="home-page">
    <section class="hero-modern">
      <div class="hero-content">
        <p class="hero-kicker">CY TECH • CAMPUS CONNECTÉ</p>
        <h1>La plateforme intelligente du campus</h1>
        <p class="hero-subtitle">
          Retrouvez vos actualités, vos événements, vos espaces et vos objets connectés
          sur une interface moderne, fluide et pensée pour tous les écrans.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="router.push('/evenements')">Explorer les événements</button>
          <button class="btn-secondary" @click="router.push('/actualites')">Voir les actualités</button>
        </div>
      </div>

      <div class="hero-stats">
        <article class="stat-card" v-for="s in quickStats" :key="s.label">
          <strong>{{ s.value }}</strong>
          <span>{{ s.label }}</span>
        </article>
      </div>
    </section>

    <section id="quisommesnous" class="section-block">
      <div class="section-header">
        <p class="eyebrow">QUI SOMMES-NOUS</p>
        <h2>Une école d’ingénieurs tournée vers l’innovation</h2>
      </div>
      <div class="about-grid">
        <article class="glass-card">
          <h3>Pédagogie active</h3>
          <p>Des projets concrets, des laboratoires connectés et une approche orientée terrain.</p>
        </article>
        <article class="glass-card">
          <h3>Écosystème tech</h3>
          <p>Un campus intelligent qui combine IoT, données et expériences utilisateur modernes.</p>
        </article>
        <article class="glass-card">
          <h3>Communauté</h3>
          <p>Étudiants, enseignants et partenaires dans une dynamique collaborative continue.</p>
        </article>
      </div>
    </section>

    <section id="formations" class="section-block alt">
      <div class="section-header">
        <p class="eyebrow">NOS FORMATIONS</p>
        <h2>Des parcours orientés métiers d’avenir</h2>
      </div>
      <div class="formation-grid">
        <article class="formation-card">
          <h3>Data & IA</h3>
          <p>Analyse de données, IA appliquée et systèmes décisionnels.</p>
        </article>
        <article class="formation-card">
          <h3>Cybersécurité</h3>
          <p>Sécurisation des systèmes, gestion des risques et architecture robuste.</p>
        </article>
        <article class="formation-card">
          <h3>Informatique embarquée</h3>
          <p>Conception de systèmes connectés et interactions temps réel.</p>
        </article>
        <article class="formation-card">
          <h3>Génie logiciel</h3>
          <p>Développement full-stack, architecture logicielle et qualité produit.</p>
        </article>
      </div>
    </section>

    <section id="objets" class="section-block">
      <div class="section-header">
        <p class="eyebrow">OBJETS CONNECTÉS</p>
        <h2>Un campus instrumenté pour mieux apprendre</h2>
      </div>
      <div class="iot-banner">
        <p>
          Capteurs, caméras, contrôles d’accès et tableaux intelligents enrichissent l’expérience
          pédagogique et la gestion des espaces.
        </p>
        <button class="btn-primary" @click="router.push('/login')">Accéder aux objets</button>
      </div>
    </section>

    <section id="actualites" class="section-block alt">
      <div class="section-header row">
        <div>
          <p class="eyebrow">ACTUALITÉS</p>
          <h2>Dernières nouvelles du campus</h2>
        </div>
        <button class="link-btn" @click="router.push('/actualites')">Toutes les actualités →</button>
      </div>

      <div v-if="loading" class="state-box">Chargement des actualités...</div>
      <div v-else-if="error" class="state-box error">{{ error }}</div>
      <div v-else-if="actualites.length === 0" class="state-box">Aucune actualité disponible.</div>

      <div v-else class="news-grid">
        <article
          class="news-card"
          v-for="item in actualites.slice(0, 6)"
          :key="item.id"
          @click="router.push(`/actualites/${item.id}`)"
        >
          <img
            :src="getImageUrl(item.imageUrl, 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=80')"
            :alt="item.title"
          />
          <div class="news-body">
            <p class="date">{{ formatDate(item.createdAt) }}</p>
            <h3>{{ item.title }}</h3>
            <p>{{ item.content }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="evenements" class="section-block">
      <div class="section-header row">
        <div>
          <p class="eyebrow">ÉVÉNEMENTS</p>
          <h2>À ne pas manquer</h2>
        </div>
        <button class="link-btn" @click="router.push('/evenements')">Tous les événements →</button>
      </div>

      <div v-if="loading" class="state-box">Chargement des événements...</div>
      <div v-else-if="error" class="state-box error">{{ error }}</div>
      <div v-else-if="evenements.length === 0" class="state-box">Aucun événement pour le moment.</div>

      <div v-else class="event-grid">
        <article
          class="event-card"
          v-for="event in evenements.slice(0, 6)"
          :key="event.id"
          @click="router.push(`/evenements/${event.id}`)"
        >
          <div class="event-image-wrap">
            <img
              :src="getImageUrl(event.imageUrl, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&q=80')"
              :alt="event.title"
            />
            <span class="event-date">{{ formatDate(event.startTime) }}</span>
          </div>
          <div class="event-body">
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
            <div class="meta-line">
              <span v-if="event.organizer">👤 {{ event.organizer }}</span>
              <span v-if="event.maxParticipants">👥 {{ event.maxParticipants }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f6f8fc;
  color: #111827;
}

.hero-modern {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 1.2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hero-content {
  background: linear-gradient(135deg, #0d2d5e 0%, #1a5c9e 60%, #3b82f6 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 16px 40px rgba(13, 45, 94, 0.25);
}

.hero-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 1.4px;
  font-weight: 700;
  color: #dbeafe;
}

.hero-content h1 {
  margin: 0.6rem 0 0.75rem;
  font-size: 42px;
  line-height: 1.1;
}

.hero-subtitle {
  margin: 0;
  color: #e5eef9;
  line-height: 1.65;
}

.hero-actions {
  margin-top: 1.4rem;
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.link-btn {
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #1a5c9e;
  color: white;
}

.btn-primary:hover { background: #0d2d5e; }

.btn-secondary {
  background: white;
  color: #0d2d5e;
}

.btn-secondary:hover { background: #f3f4f6; }

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: 0 8px 22px rgba(17, 24, 39, 0.06);
}

.stat-card strong {
  display: block;
  color: #0d2d5e;
  font-size: 30px;
}

.stat-card span {
  color: #6b7280;
  font-size: 13px;
}

.section-block {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.section-block.alt {
  background: #ffffff;
  border-top: 1px solid #edf0f5;
  border-bottom: 1px solid #edf0f5;
}

.section-header {
  margin-bottom: 1.15rem;
}

.section-header.row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  color: #1a5c9e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.section-header h2 {
  margin: 0.35rem 0 0;
  color: #0d2d5e;
}

.about-grid,
.formation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.formation-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.glass-card,
.formation-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem;
}

.glass-card h3,
.formation-card h3 {
  margin: 0;
  color: #0d2d5e;
}

.glass-card p,
.formation-card p {
  margin: 0.55rem 0 0;
  color: #6b7280;
}

.iot-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  padding: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.iot-banner p {
  margin: 0;
  color: #1f2937;
}

.link-btn {
  background: transparent;
  color: #1a5c9e;
  padding: 0;
}

.link-btn:hover { text-decoration: underline; }

.news-grid,
.event-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.news-card,
.event-card {
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(17, 24, 39, 0.06);
  transition: transform 0.15s, box-shadow 0.2s;
}

.news-card:hover,
.event-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(17, 24, 39, 0.12);
}

.news-card img,
.event-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.news-body,
.event-body {
  padding: 0.9rem;
}

.news-body .date {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.news-body h3,
.event-body h3 {
  margin: 0.35rem 0 0.45rem;
  color: #0d2d5e;
  font-size: 18px;
}

.news-body p,
.event-body p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-image-wrap {
  position: relative;
}

.event-date {
  position: absolute;
  left: 10px;
  bottom: 10px;
  background: #1a5c9e;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 4px 10px;
}

.meta-line {
  margin-top: 0.65rem;
  display: flex;
  gap: 0.7rem;
  color: #6b7280;
  font-size: 12px;
}

.state-box {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  background: white;
  color: #4b5563;
}

.state-box.error {
  color: #991b1b;
  background: #fef2f2;
}

.contact-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  color: #374151;
}

.contact-section h2 {
  margin: 0 0 0.5rem;
  color: #0d2d5e;
}

.contact-section p {
  margin: 0.2rem 0;
}

@media (max-width: 1000px) {
  .hero-modern {
    grid-template-columns: 1fr;
  }

  .about-grid,
  .news-grid,
  .event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .formation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-content {
    padding: 1.2rem;
  }

  .hero-content h1 {
    font-size: 30px;
  }

  .hero-stats {
    grid-template-columns: 1fr 1fr;
  }

  .about-grid,
  .formation-grid,
  .news-grid,
  .event-grid {
    grid-template-columns: 1fr;
  }
}
</style>
