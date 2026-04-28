<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const evenements = ref([])
const loading = ref(true)
const erreur = ref(null)

function allerAuDetail(id) {
  router.push(`/evenements/${id}`)
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/home')
    const data = await response.json()
    if (data.success) {
      evenements.value = data.data.events
    }
  } catch (e) {
    erreur.value = 'Impossible de charger les événements.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="evenements-section" id="evenements">
    <div class="evenements-inner">
      <p class="section-label">ÉVÉNEMENTS</p>
      <h2 class="section-titre">Agenda du campus</h2>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement des événements...</p>
      </div>

      <div v-else-if="erreur" class="erreur">{{ erreur }}</div>

      <div v-else-if="evenements.length === 0" class="vide">
        Aucun événement à venir pour le moment.
      </div>

      <div v-else class="evenements-cards">
        <div class="evenement-card" v-for="e in evenements" :key="e.id" @click="allerAuDetail(e.id)">
          <div class="evenement-img-wrapper">
            <img
              :src="e.imageUrl ? `http://localhost:3000/${e.imageUrl}` : 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&q=80'"
              :alt="e.title"
              class="evenement-img"
            />
            <div class="evenement-date">
              {{ new Date(e.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </div>
          </div>
          <div class="evenement-body">
            <h3 class="evenement-titre">{{ e.title }}</h3>
            <p class="evenement-desc">{{ e.description }}</p>
            <div class="evenement-infos">
              <span v-if="e.organizer">👤 {{ e.organizer }}</span>
              <span v-if="e.maxParticipants">👥 {{ e.maxParticipants }} places</span>
            </div>
            <button class="btn-inscrire">Je m'inscris</button>
          </div>
        </div>
      </div>

      <div class="actu-footer" v-if="evenements.length > 0">
        <button class="btn-plus" @click="router.push('/evenements')">Voir tous les événements</button>
      </div>

    </div>
  </section>
</template>

<style scoped>
.evenements-section {
  background: white;
  padding: 5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}
.evenements-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.section-label {
  color: #1a5c9e;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.section-titre {
  color: #0d2d5e;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 2.5rem;
}
.evenements-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.evenement-card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}
.evenement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(26,92,158,0.12);
}
.evenement-img-wrapper { position: relative; }
.evenement-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.evenement-date {
  position: absolute;
  bottom: 12px; left: 12px;
  background: #1a5c9e; color: white;
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px;
}
.evenement-body { padding: 1.25rem; }
.evenement-titre {
  color: #0d2d5e; font-size: 16px;
  font-weight: 700; margin-bottom: 8px;
}
.evenement-desc {
  color: #666; font-size: 14px;
  line-height: 1.6; margin-bottom: 10px;
}
.evenement-infos {
  display: flex; gap: 12px;
  font-size: 12px; color: #999;
  margin-bottom: 1rem; flex-wrap: wrap;
}
.btn-inscrire {
  width: 100%; padding: 10px;
  background: #1a5c9e; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-size: 14px; font-weight: 600;
  transition: background 0.2s;
}
.btn-inscrire:hover { background: #0d2d5e; }
.actu-footer {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}
.btn-plus {
  padding: 12px 36px;
  background: #1a5c9e; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-size: 15px; font-weight: 600;
  transition: background 0.2s;
}
.btn-plus:hover { background: #0d2d5e; }
.loading { text-align: center; padding: 3rem; color: #666; }
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #1a5c9e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.erreur { text-align: center; padding: 2rem; color: #dc2626; background: #fef2f2; border-radius: 10px; }
.vide { text-align: center; padding: 2rem; color: #999; font-size: 15px; }

@media (max-width: 480px) {
  .evenements-section { padding: 3rem 1rem; }
  .section-titre { font-size: 1.6rem; }
  .evenements-cards { grid-template-columns: 1fr; }
}
</style>