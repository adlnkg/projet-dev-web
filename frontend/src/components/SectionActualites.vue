<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const actualites = ref([])
const loading = ref(true)
const erreur = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/home')
    const data = await response.json()
    if (data.success) {
      actualites.value = data.data.actualities
    }
  } catch (e) {
    erreur.value = 'Impossible de charger les actualités.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="actu-section" id="actualites">
    <div class="actu-inner">
      <p class="section-label">ACTUALITÉS</p>
      <h2 class="section-titre">Dernières actualités</h2>

      <div v-if="loading" class="actu-loading">
        <div class="spinner"></div>
        <p>Chargement des actualités...</p>
      </div>

      <div v-else-if="erreur" class="actu-erreur">{{ erreur }}</div>

      <div v-else-if="actualites.length === 0" class="actu-vide">
        Aucune actualité disponible pour le moment.
      </div>

      <div v-else class="actu-cards">
        <div class="actu-card" v-for="a in actualites" :key="a.id">
          <img
            :src="a.imageUrl ? `http://localhost:3000/${a.imageUrl}` : 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80'"
            :alt="a.title"
            class="actu-img"
          />
          <div class="actu-overlay">
            <div class="actu-date">{{ new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</div>
            <h3 class="actu-titre-card">{{ a.title }}</h3>
            <p class="actu-content">{{ a.content }}</p>
          </div>
        </div>
      </div>

      <div class="actu-footer" v-if="actualites.length > 0">
        <button class="btn-plus" @click="router.push('/actualites')">En savoir plus</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.actu-section {
  background: white;
  padding: 5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}
.actu-inner {
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
.actu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}
.actu-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
}
.actu-card:hover .actu-img { transform: scale(1.03); }
.actu-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.actu-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
  padding: 2rem 1.5rem 1.5rem;
}
.actu-date { color: #a8cbf0; font-size: 12px; margin-bottom: 8px; }
.actu-titre-card { color: white; font-size: 18px; font-weight: 700; line-height: 1.4; margin-bottom: 8px; }
.actu-content {
  color: #d6e8f7; font-size: 13px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.actu-footer { display: flex; justify-content: center; margin-top: 2.5rem; }
.btn-plus {
  padding: 12px 36px;
  background: #1a5c9e; color: white; border: none;
  border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600;
  transition: background 0.2s;
}
.btn-plus:hover { background: #0d2d5e; }
.actu-loading { text-align: center; padding: 3rem; color: #666; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #e5e7eb;
  border-top-color: #1a5c9e; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.actu-erreur { text-align: center; padding: 2rem; color: #dc2626; background: #fef2f2; border-radius: 10px; }
.actu-vide { text-align: center; padding: 2rem; color: #999; font-size: 15px; }

@media (max-width: 768px) {
  .actu-cards { grid-template-columns: 1fr; }
  .actu-img { height: 220px; }
}
@media (max-width: 480px) {
  .actu-section { padding: 3rem 1rem; }
  .section-titre { font-size: 1.6rem; }
}
</style>