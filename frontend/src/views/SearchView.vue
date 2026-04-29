<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMe } from '../utils/user'

const route = useRoute()
const router = useRouter()

const keywords = ref('')
const selectedCategory = ref('all')
const filtersInfo = ref(null)
const filtersLoading = ref(false)
const searchLoading = ref(false)
const searchError = ref(null)
const results = ref([])
const hasSearched = ref(false)
const filterValues = ref({})
const currentUser = ref(null)

const categoryLabels = {
  all: 'Tous',
  event: 'Événements',
  actuality: 'Actualités',
  area: 'Endroits',
  device: 'Objets connectés',
}

const typeConfig = {
  event: { label: 'Événement', color: '#1a5c9e', bg: '#dbeafe', icon: '📅' },
  actuality: { label: 'Actualité', color: '#15803d', bg: '#dcfce7', icon: '📰' },
  device: { label: 'Objet connecté', color: '#7c3aed', bg: '#ede9fe', icon: '📡' },
  area: { label: 'Endroit', color: '#c2410c', bg: '#ffedd5', icon: '🏫' },
}

const categoryOrder = ['all', 'event', 'actuality', 'area', 'device']

const getToken = () => localStorage.getItem('token')
const isSuperUserOrAdmin = computed(() => currentUser.value && ['SUPER_USER', 'ADMIN'].includes(currentUser.value.role))

const categories = computed(() => {
  if (!filtersInfo.value) return []
  const items = []
  if (filtersInfo.value.globalSearch) {
    items.push({ value: 'all', label: categoryLabels.all })
  }
  const entityTypes = filtersInfo.value.entityTypes || {}
  Object.keys(entityTypes).forEach((key) => {
    const config = entityTypes[key]
    if (config.requiresAuth && !getToken()) return
    items.push({ value: key, label: categoryLabels[key] || key })
  })
  return items.sort(
    (a, b) => categoryOrder.indexOf(a.value) - categoryOrder.indexOf(b.value)
  )
})

const activeFilters = computed(() => {
  if (!filtersInfo.value) return []
  if (selectedCategory.value === 'all') {
    return filtersInfo.value.globalSearch?.filters || []
  }
  return filtersInfo.value.entityTypes?.[selectedCategory.value]?.filters || []
})

const visibleFilters = computed(() =>
  activeFilters.value.filter((filter) => filter.name !== 'keywords')
)

const hasCriteria = computed(() => {
  if (keywords.value.trim()) return true
  return visibleFilters.value.some((filter) => {
    const value = filterValues.value[filter.name]
    return value !== '' && value !== null && value !== undefined
  })
})

const resolveType = (item) => {
  if (item.entityType) return String(item.entityType).toLowerCase()
  if (selectedCategory.value !== 'all') return selectedCategory.value
  if ('startTime' in item) return 'event'
  if ('brand' in item || 'model' in item) return 'device'
  if ('content' in item) return 'actuality'
  return 'area'
}

const getItemTitle = (item) => item.title ?? item.name ?? '—'

const getItemSubtitle = (item, type) => {
  if (type === 'event') {
    const parts = []
    if (item.startTime) {
      parts.push(
        new Date(item.startTime).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      )
    }
    if (item.organizer) parts.push(item.organizer)
    return parts.join(' · ')
  }
  if (type === 'actuality') {
    return item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : ''
  }
  if (type === 'device') {
    return [item.type, item.brand].filter(Boolean).join(' · ')
  }
  if (type === 'area') {
    return item.type || ''
  }
  return ''
}

const getItemDescription = (item, type) => {
  if (type === 'event') return item.description
  if (type === 'actuality') return item.content
  if (type === 'device') return item.description
  if (type === 'area') return item.description
  return ''
}

const getItemImage = (item, type) => {
  if (item.imageUrl) return `http://localhost:3000/${item.imageUrl}`
  if (type === 'event') {
    return 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80'
  }
  if (type === 'actuality') {
    return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80'
  }
  if (type === 'device') {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'
  }
  return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80'
}

const getItemRoute = (itemType, itemId) => {
  if (itemType === 'event') return `/evenements/${itemId}`
  if (itemType === 'actuality') return `/actualites/${itemId}`
  return null
}

const canRequestDeletion = (itemType) => isSuperUserOrAdmin.value && (itemType === 'event' || itemType === 'device')

const requestDeletion = async (item, event) => {
  event.stopPropagation()
  const token = getToken()
  if (!token) {
    searchError.value = 'Connexion requise.'
    return
  }

  const entityLabel = item._type === 'event' ? 'cet événement' : 'cet objet connecté'
  if (!confirm(`Envoyer une demande de suppression pour ${entityLabel} ?`)) return

  try {
    const endpoint = item._type === 'event' ? '/api/events' : '/api/devices'
    const response = await fetch(`http://localhost:3000${endpoint}/${item.id}/deletion-request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Demande impossible')
    }
    alert('Demande de suppression envoyée à un admin.')
  } catch (error) {
    alert(error.message || 'Erreur lors de la demande de suppression')
  }
}

const getFilterLabel = (filter) => filter.description || filter.name

const resetFilterValues = () => {
  const nextValues = {}
  visibleFilters.value.forEach((filter) => {
    nextValues[filter.name] = ''
  })
  filterValues.value = nextValues
}

const syncQueryToState = () => {
  const queryKeywords = typeof route.query.keywords === 'string' ? route.query.keywords : ''
  const queryCategory = typeof route.query.category === 'string' ? route.query.category : ''
  keywords.value = queryKeywords

  const categoryMatch = categories.value.find((cat) => cat.value === queryCategory)
  if (categoryMatch) {
    selectedCategory.value = categoryMatch.value
  } else if (categories.value.length) {
    selectedCategory.value = categories.value[0].value
  }

  resetFilterValues()
  visibleFilters.value.forEach((filter) => {
    if (route.query[filter.name] !== undefined) {
      filterValues.value[filter.name] = route.query[filter.name]
    }
  })
}

const syncStateToQuery = () => {
  const query = {}
  if (keywords.value.trim()) query.keywords = keywords.value.trim()
  if (selectedCategory.value) query.category = selectedCategory.value
  visibleFilters.value.forEach((filter) => {
    const value = filterValues.value[filter.name]
    if (value !== '' && value !== null && value !== undefined) {
      query[filter.name] = value
    }
  })
  router.replace({ query })
}

const fetchFiltersInfo = async () => {
  filtersLoading.value = true
  try {
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await fetch('http://localhost:3000/api/search/info', { headers })
    const data = await response.json()
    if (data.success) {
      filtersInfo.value = data
    }
  } catch (error) {
    searchError.value = "Impossible de charger les filtres de recherche."
  } finally {
    filtersLoading.value = false
  }
}

const lancerRecherche = async () => {
  if (!filtersInfo.value) return
  searchError.value = null
  hasSearched.value = true
  results.value = []

  const token = getToken()
  const requiresAuth =
    selectedCategory.value !== 'all' &&
    filtersInfo.value.entityTypes?.[selectedCategory.value]?.requiresAuth

  if (requiresAuth && !token) {
    searchError.value = 'Connexion requise pour cette categorie.'
    return
  }

  searchLoading.value = true
  try {
    const params = new URLSearchParams()
    if (keywords.value.trim()) params.set('keywords', keywords.value.trim())

    visibleFilters.value.forEach((filter) => {
      const value = filterValues.value[filter.name]
      if (value !== '' && value !== null && value !== undefined) {
        params.set(filter.name, value)
      }
    })

    let endpoint = '/api/search'
    if (selectedCategory.value === 'event') endpoint = '/api/events/search'
    if (selectedCategory.value === 'area') endpoint = '/api/areas/search'
    if (selectedCategory.value === 'device') endpoint = '/api/devices/search'
    if (selectedCategory.value === 'actuality') endpoint = '/api/actualities/search'

    const url = `http://localhost:3000${endpoint}?${params.toString()}`
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await fetch(url, { headers })
    const data = await response.json()

    if (data.success) {
      results.value = data.data.map((item) => ({
        ...item,
        _type: resolveType(item),
      }))
    } else {
      searchError.value = data.message || 'Recherche impossible pour le moment.'
    }

    syncStateToQuery()
  } catch (error) {
    searchError.value = 'Impossible de contacter le serveur.'
  } finally {
    searchLoading.value = false
  }
}

const reinitialiser = () => {
  keywords.value = ''
  resetFilterValues()
  results.value = []
  hasSearched.value = false
  searchError.value = null
  router.replace({ query: {} })
}

watch(
  () => selectedCategory.value,
  () => {
    resetFilterValues()
  }
)

watch(
  () => route.query,
  () => {
    if (!filtersInfo.value) return
    syncQueryToState()
  }
)

onMounted(async () => {
  try {
    currentUser.value = await getMe()
  } catch (error) {
    currentUser.value = null
  }
  await fetchFiltersInfo()
  syncQueryToState()
  if (hasCriteria.value) {
    await lancerRecherche()
  }
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="header-inner">
        <a @click="router.push('/')" class="back-btn">← Retour à l'accueil</a>
        <h1 class="page-titre">Recherche globale</h1>
        <p class="page-sous-titre">Recherchez dans tous les contenus du campus de Cergy</p>
      </div>
    </div>

    <div class="search-section">
      <div class="search-inner">
        <div class="search-grid">
          <div class="search-field full">
            <label>Mot-cle</label>
            <input
              v-model="keywords"
              type="text"
              placeholder="Rechercher par mots cles..."
              class="search-input"
              @keyup.enter="lancerRecherche"
            />
          </div>
        </div>

        <div class="category-row" v-if="!filtersLoading && categories.length">
          <span class="category-label">Categorie</span>
          <div class="cat-pills">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="cat-pill"
              :class="{ active: selectedCategory === cat.value }"
              @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div v-if="filtersLoading" class="loading-filters">
          Chargement des filtres...
        </div>

        <div v-else class="filters-grid">
          <div v-for="filter in visibleFilters" :key="filter.name" class="search-field">
            <label>{{ getFilterLabel(filter) }}</label>

            <input
              v-if="filter.type === 'string'"
              v-model="filterValues[filter.name]"
              type="text"
              class="search-input"
              :placeholder="filter.description"
              @keyup.enter="lancerRecherche"
            />

            <input
              v-else-if="filter.type === 'date'"
              v-model="filterValues[filter.name]"
              type="date"
              class="search-input"
            />

            <input
              v-else-if="filter.type === 'number' || filter.type === 'integer'"
              v-model="filterValues[filter.name]"
              type="number"
              class="search-input"
              :min="filter.min ?? undefined"
            />

            <select
              v-else-if="filter.type === 'enum'"
              v-model="filterValues[filter.name]"
              class="search-select"
            >
              <option value="">Tous</option>
              <option v-for="value in filter.values" :key="value" :value="value">{{ value }}</option>
            </select>

            <select
              v-else-if="filter.type === 'boolean'"
              v-model="filterValues[filter.name]"
              class="search-select"
            >
              <option value="">Indifferent</option>
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>

            <input
              v-else
              v-model="filterValues[filter.name]"
              type="text"
              class="search-input"
              @keyup.enter="lancerRecherche"
            />
          </div>
        </div>

        <div class="search-actions">
          <button class="btn-primary" @click="lancerRecherche" :disabled="searchLoading">
            {{ searchLoading ? 'Recherche...' : 'Rechercher' }}
          </button>
          <button class="btn-secondary" @click="reinitialiser">Reinitialiser</button>
        </div>
      </div>
    </div>

    <div class="resultats-section">
      <div class="resultats-inner">
        <div v-if="searchLoading" class="loading">
          <div class="spinner"></div>
          <p>Recherche en cours...</p>
        </div>

        <div v-else-if="searchError" class="erreur">{{ searchError }}</div>

        <div v-else-if="hasSearched" class="compteur">
          {{ results.length }} resultat{{ results.length !== 1 ? 's' : '' }} trouve{{ results.length !== 1 ? 's' : '' }}
        </div>

        <div class="resultats-liste" v-if="results.length > 0">
          <div
            class="resultat-card"
            v-for="item in results"
            :key="`${item._type}-${item.id}`"
            :class="{ clickable: getItemRoute(item._type, item.id) }"
            @click="getItemRoute(item._type, item.id) && router.push(getItemRoute(item._type, item.id))"
          >
            <img
              :src="getItemImage(item, item._type)"
              :alt="getItemTitle(item)"
              class="resultat-img"
            />
            <div class="resultat-body">
              <div class="resultat-header">
                <span
                  class="resultat-type"
                  :style="{ color: typeConfig[item._type]?.color, background: typeConfig[item._type]?.bg }"
                >
                  {{ typeConfig[item._type]?.icon }} {{ typeConfig[item._type]?.label || item._type }}
                </span>
                <span class="resultat-date" v-if="getItemSubtitle(item, item._type)">
                  {{ getItemSubtitle(item, item._type) }}
                </span>
              </div>
              <h3 class="resultat-titre">{{ getItemTitle(item) }}</h3>
              <p class="resultat-content" v-if="getItemDescription(item, item._type)">
                {{ getItemDescription(item, item._type) }}
              </p>
              <div class="resultat-actions" v-if="canRequestDeletion(item._type)">
                <button class="btn-secondary" @click="requestDeletion(item, $event)">
                  Demander suppression
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="hasSearched && !searchLoading" class="vide">
          <div class="vide-icon">🔎</div>
          <p>Aucun resultat trouve.</p>
          <p class="vide-sub">Essayez avec d'autres mots cles ou modifiez les filtres.</p>
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

.back-btn:hover {
  color: white;
}

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.search-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 1.5rem;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.search-field.full {
  grid-column: 1 / -1;
}

.search-field label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.search-input,
.search-select {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  color: #333;
  transition: border-color 0.2s;
}

.search-input:focus,
.search-select:focus {
  border-color: #1a5c9e;
}

.category-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.category-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.cat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-pill {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s;
}

.cat-pill:hover {
  border-color: #1a5c9e;
  color: #1a5c9e;
}

.cat-pill.active {
  background: #1a5c9e;
  border-color: #1a5c9e;
  color: white;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 1.5rem;
}

.search-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  padding: 10px 28px;
  background: #1a5c9e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0d2d5e;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #666;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #f4f6f9;
}

.loading-filters {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 1rem;
}

.resultats-section {
  padding: 2rem;
}

.resultats-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.compteur {
  font-size: 14px;
  color: #666;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.resultats-liste {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resultat-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s, transform 0.15s;
}

.resultat-card.clickable {
  cursor: pointer;
}

.resultat-card.clickable:hover {
  box-shadow: 0 4px 16px rgba(26, 92, 158, 0.1);
  transform: translateY(-2px);
}

.resultat-img {
  width: 200px;
  height: 160px;
  object-fit: cover;
  flex-shrink: 0;
}

.resultat-body {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resultat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.resultat-type {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.resultat-date {
  font-size: 12px;
  color: #999;
}

.resultat-titre {
  font-size: 18px;
  font-weight: 700;
  color: #0d2d5e;
}

.resultat-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #1a5c9e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.erreur {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 10px;
}

.vide {
  text-align: center;
  padding: 4rem;
  color: #999;
}

.vide-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.vide-sub {
  font-size: 13px;
  margin-top: 4px;
}

@media (max-width: 900px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .resultat-card {
    flex-direction: column;
  }

  .resultat-img {
    width: 100%;
    height: 200px;
  }

  .page-titre {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .search-section {
    padding: 1rem;
  }

  .resultats-section {
    padding: 1rem;
  }
}
</style>
