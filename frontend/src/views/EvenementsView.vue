<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMe } from '../utils/user'

const router = useRouter()
const recherche = ref('')
const typeChoisi = ref('')
const dateDebut = ref('')
const dateFin = ref('')
const resultats = ref([])
const loading = ref(false)
const erreur = ref(null)
const rechercheLancee = ref(false)
const currentUser = ref(null)

const types = ['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'SPORT', 'OTHER']

const isAdmin = computed(() => currentUser.value && (currentUser.value.role === 'ADMIN' || currentUser.value.role === 'SUPER_USER'))

function allerAuDetail(id) {
  router.push(`/evenements/${id}`)
}

async function lancerRecherche() {
  loading.value = true
  erreur.value = null
  rechercheLancee.value = true
  resultats.value = []

  try {
    let url = 'http://localhost:3000/api/events/search?'
    if (recherche.value) url += `keywords=${encodeURIComponent(recherche.value)}&`
    if (typeChoisi.value) url += `type=${typeChoisi.value}&`
    if (dateDebut.value) url += `startFrom=${dateDebut.value}&`
    if (dateFin.value) url += `startTo=${dateFin.value}&`

    const response = await fetch(url)
    const data = await response.json()
    if (data.success) {
      resultats.value = data.data
    }
  } catch (e) {
    erreur.value = 'Impossible de contacter le serveur.'
  } finally {
    loading.value = false
  }
}

async function supprimerEvenement(id, event) {
  event.stopPropagation()
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.success) {
      resultats.value = resultats.value.filter(r => r.id !== id)
    } else {
      alert(data.error || 'Erreur lors de la suppression')
    }
  } catch (e) {
    alert('Erreur lors de la suppression')
  }
}

function reinitialiser() {
  recherche.value = ''
  typeChoisi.value = ''
  dateDebut.value = ''
  dateFin.value = ''
  resultats.value = []
  rechercheLancee.value = false
}

onMounted(async () => {
  try {
    currentUser.value = await getMe()
  } catch (e) {
    // User not connected, that's fine
  }
  lancerRecherche()
})
</script>

<template>
  <div class="page">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-inner">
        <a @click="router.push('/')" class="back-btn">← Retour à l'accueil</a>
        <h1 class="page-titre">Recherche d'événements</h1>
        <p class="page-sous-titre">Retrouvez tous les événements du campus de Cergy</p>
      </div>
    </div>

    <!-- BARRE DE RECHERCHE -->
    <div class="search-section">
      <div class="search-inner">
        <div class="search-grid">
          <div class="search-field full">
            <label>Mot-clé</label>
            <input
              v-model="recherche"
              type="text"
              placeholder="Rechercher un événement..."
              class="search-input"
              @keyup.enter="lancerRecherche"
            />
          </div>
          <div class="search-field">
            <label>Type</label>
            <select v-model="typeChoisi" class="search-select">
              <option value="">Tous les types</option>
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="search-field">
            <label>Date de début</label>
            <input v-model="dateDebut" type="date" class="search-input" />
          </div>
          <div class="search-field">
            <label>Date de fin</label>
            <input v-model="dateFin" type="date" class="search-input" />
          </div>
        </div>
        <div class="search-actions">
          <button class="btn-primary" @click="lancerRecherche">🔍 Rechercher</button>
          <button class="btn-secondary" @click="reinitialiser">Réinitialiser</button>
        </div>
      </div>
    </div>

    <!-- RÉSULTATS -->
    <div class="resultats-section">
      <div class="resultats-inner">

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Recherche en cours...</p>
        </div>

        <div v-else-if="erreur" class="erreur">{{ erreur }}</div>

        <div v-else-if="rechercheLancee" class="compteur">
          {{ resultats.length }} résultat{{ resultats.length !== 1 ? 's' : '' }} trouvé{{ resultats.length !== 1 ? 's' : '' }}
        </div>

        <div class="resultats-liste" v-if="resultats.length > 0">
          <div class="resultat-card" v-for="r in resultats" :key="r.id" @click="allerAuDetail(r.id)">
            <button v-if="isAdmin" class="btn-supprimer" @click="supprimerEvenement(r.id, $event)" title="Supprimer l'événement">✕</button>
            <img
              :src="r.imageUrl ? `http://localhost:3000/${r.imageUrl}` : 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80'"
              :alt="r.title"
              class="resultat-img"
            />
            <div class="resultat-body">
              <div class="resultat-header">
                <span class="resultat-type" v-if="r.type">{{ r.type }}</span>
                <span class="resultat-date" v-if="r.startTime">
                  {{ new Date(r.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                </span>
              </div>
              <h3 class="resultat-titre">{{ r.title }}</h3>
              <p class="resultat-content">{{ r.description }}</p>
              <div class="resultat-infos">
                <span v-if="r.organizer">👤 {{ r.organizer }}</span>
                <span v-if="r.numberOfParticipants && r.maxParticipants">👥 {{ r.maxParticipants - r.numberOfParticipants }} / {{ r.maxParticipants }} places restantes</span>
                <span v-if="r.price !== undefined">💰 {{ r.price === 0 ? 'Gratuit' : r.price + '€' }}</span>
              </div>
              <button class="btn-inscrire">Je m'inscris</button>
            </div>
          </div>
        </div>

        <div v-else-if="rechercheLancee && !loading" class="vide">
          <div class="vide-icon">🔎</div>
          <p>Aucun événement trouvé.</p>
          <p class="vide-sub">Essayez avec d'autres mots-clés ou modifiez les filtres.</p>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f4f6f9;
  font-family: 'Segoe UI', sans-serif;
}
.page-header {
  background: #1a5c9e;
  padding: 3rem 2rem;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.back-btn {
  color: #a8cbf0;
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
  margin-bottom: 1rem;
  transition: color 0.2s;
}
.back-btn:hover { color: white; }
.page-titre {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
}
.page-sous-titre {
  color: #a8cbf0;
  font-size: 16px;
}
.search-section {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.search-inner { max-width: 1100px; margin: 0 auto; }
.search-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 1rem;
}
.search-field { display: flex; flex-direction: column; gap: 5px; }
.search-field.full { grid-column: 1 / -1; }
.search-field label { font-size: 12px; font-weight: 600; color: #555; }
.search-input, .search-select {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  color: #333;
  transition: border-color 0.2s;
}
.search-input:focus, .search-select:focus { border-color: #1a5c9e; }
.search-actions { display: flex; gap: 10px; }
.btn-primary {
  padding: 10px 28px;
  background: #1a5c9e; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-size: 14px; font-weight: 600;
  transition: background 0.2s;
}
.btn-primary:hover { background: #0d2d5e; }
.btn-secondary {
  padding: 10px 20px;
  background: white; color: #666;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px; cursor: pointer; font-size: 14px;
}
.btn-secondary:hover { background: #f4f6f9; }
.resultats-section { padding: 2rem; }
.resultats-inner { max-width: 1100px; margin: 0 auto; }
.compteur { font-size: 14px; color: #666; margin-bottom: 1.5rem; font-weight: 500; }
.resultats-liste { display: flex; flex-direction: column; gap: 16px; }
.resultat-card {
  background: white; border-radius: 14px; overflow: hidden;
  display: flex; border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;
}
.resultat-card:hover {
  box-shadow: 0 4px 16px rgba(26,92,158,0.1);
  transform: translateY(-2px);
}
.resultat-img { width: 200px; height: 160px; object-fit: cover; flex-shrink: 0; }
.resultat-body {
  padding: 1.25rem; flex: 1;
  display: flex; flex-direction: column; gap: 8px;
}
.resultat-header { display: flex; align-items: center; gap: 10px; }
.resultat-type {
  background: #dbeafe; color: #1e40af;
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
}
.resultat-date { font-size: 12px; color: #999; }
.resultat-titre { font-size: 18px; font-weight: 700; color: #0d2d5e; }
.resultat-content { font-size: 14px; color: #666; line-height: 1.6; flex: 1; }
.resultat-infos {
  display: flex; gap: 16px;
  font-size: 12px; color: #999; flex-wrap: wrap;
}
.btn-inscrire {
  padding: 10px 20px;
  background: #1a5c9e; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-size: 14px; font-weight: 600;
  transition: background 0.2s; align-self: flex-start;
}
.btn-inscrire:hover { background: #0d2d5e; }
.loading { text-align: center; padding: 3rem; color: #666; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #e5e7eb;
  border-top-color: #1a5c9e; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.erreur { text-align: center; padding: 2rem; color: #dc2626; background: #fef2f2; border-radius: 10px; }
.vide { text-align: center; padding: 4rem; color: #999; }
.vide-icon { font-size: 3rem; margin-bottom: 12px; }
.vide-sub { font-size: 13px; margin-top: 4px; }

@media (max-width: 768px) {
  .search-grid { grid-template-columns: 1fr; }
  .resultat-card { flex-direction: column; }
  .resultat-img { width: 100%; height: 200px; }
  .page-titre { font-size: 1.8rem; }
}
@media (max-width: 480px) {
  .page-header { padding: 2rem 1rem; }
  .search-section { padding: 1rem; }
  .resultats-section { padding: 1rem; }
}
</style>
