<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const users = ref([])
const loading = ref(false)
const error = ref(null)
const searchPerformed = ref(false)

// Filtres
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const roleFilter = ref('')
const memberTypeFilter = ref('')

// Options de tri et filtres
const sortOptions = [
  { value: 'createdAt', label: 'Date d\'inscription' },
  { value: 'points', label: 'Points' },
  { value: 'login', label: 'Nom' },
]

const roleOptions = [
  { value: '', label: 'Tous les rôles' },
  { value: 'USER', label: 'Utilisateur' },
  { value: 'SUPER_USER', label: 'Super Utilisateur' },
  { value: 'ADMIN', label: 'Administrateur' },
]

const memberTypeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'STUDENT', label: 'Étudiant' },
  { value: 'STAFF', label: 'Personnel' },
  { value: 'VISITOR', label: 'Visiteur' },
]

// Charger tous les utilisateurs au montage
async function loadAllUsers() {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const response = await fetch('http://localhost:3000/api/user', { headers })
    const data = await response.json()
    
    if (data.success) {
      users.value = data.data
    } else {
      throw new Error(data.error || 'Erreur lors du chargement')
    }
  } catch (e) {
    error.value = e.message || 'Impossible de charger les utilisateurs'
  } finally {
    loading.value = false
  }
}

// Appliquer les filtres et le tri
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // Filtre par recherche textuelle
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
      return (
        user.login.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        (user.email && user.email.toLowerCase().includes(query))
      )
    })
  }
  
  // Filtre par rôle
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }
  
  // Filtre par type de membre
  if (memberTypeFilter.value) {
    result = result.filter(user => user.memberType === memberTypeFilter.value)
  }
  
  // Tri
  result.sort((a, b) => {
    let valA = a[sortBy.value]
    let valB = b[sortBy.value]
    
    // Gérer les valeurs nulles
    if (valA == null) valA = ''
    if (valB == null) valB = ''
    
    // Comparaison selon le type
    if (sortBy.value === 'createdAt') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    } else if (sortBy.value === 'points') {
      valA = Number(valA) || 0
      valB = Number(valB) || 0
    } else {
      valA = String(valA).toLowerCase()
      valB = String(valB).toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return valA > valB ? 1 : -1
    } else {
      return valA < valB ? 1 : -1
    }
  })
  
  return result
})

// Inverser l'ordre de tri
function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

// Réinitialiser les filtres
function resetFilters() {
  searchQuery.value = ''
  roleFilter.value = ''
  memberTypeFilter.value = ''
  sortBy.value = 'createdAt'
  sortOrder.value = 'desc'
}

// Naviguer vers le profil public
function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

// Formater la date
function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Obtenir l'avatar ou l'initiale
function getAvatar(user) {
  if (user.avatarUrl) return user.avatarUrl
  return null
}

function getInitials(user) {
  return (user.firstName?.[0] || user.login?.[0] || 'U').toUpperCase()
}

// Libellé du type de membre
function memberTypeLabel(value) {
  const labels = {
    STUDENT: 'Étudiant',
    STAFF: 'Personnel',
    VISITOR: 'Visiteur',
    ADMIN: 'Administrateur'
  }
  return labels[value] || value || '—'
}

onMounted(() => {
  loadAllUsers()
  searchPerformed.value = true
})
</script>

// Naviguer vers le profil public
function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

// Formater la date
function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Obtenir l'avatar ou l'initiale
function getAvatar(user) {
  if (user.avatarUrl) return user.avatarUrl
  const initial = (user.firstName?.[0] || user.login?.[0] || 'U').toUpperCase()
  return null
}

function getInitials(user) {
  return (user.firstName?.[0] || user.login?.[0] || 'U').toUpperCase()
}

// Libellé du type de membre
function memberTypeLabel(value) {
  const labels = {
    STUDENT: 'Étudiant',
    STAFF: 'Personnel',
    VISITOR: 'Visiteur',
    ADMIN: 'Administrateur'
  }
  return labels[value] || value || '—'
}

onMounted(() => {
  loadAllUsers()
  searchPerformed.value = true
})
</script>

<template>
  <div class="page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-inner">
        <a @click="router.push('/')" class="back-btn">← Retour à l'accueil</a>
        <h1 class="page-titre">Annuaire des utilisateurs</h1>
        <p class="page-sous-titre">Découvrez les membres de la communauté CYTech</p>
      </div>
    </div>

    <!-- FILTRES ET RECHERCHE -->
    <div class="filters-section">
      <div class="filters-container">
        <!-- Recherche textuelle -->
        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom, login ou email..."
            class="search-input"
          />
        </div>
        
        <!-- Filtres -->
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Trier par</label>
            <select v-model="sortBy" class="filter-select">
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Ordre</label>
            <button class="sort-order-btn" @click="toggleSortOrder">
              <i :class="sortOrder === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down'"></i>
              {{ sortOrder === 'asc' ? 'Croissant' : 'Décroissant' }}
            </button>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Rôle</label>
            <select v-model="roleFilter" class="filter-select">
              <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Type de membre</label>
            <select v-model="memberTypeFilter" class="filter-select">
              <option v-for="opt in memberTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          
          <button class="reset-btn" @click="resetFilters">
            <i class="pi pi-refresh"></i>
            Réinitialiser
          </button>
        </div>
        
        <p class="search-hint">
          <span v-if="filteredUsers.length === 0">Aucun utilisateur trouvé</span>
          <span v-else-if="searchQuery || roleFilter || memberTypeFilter">{{ filteredUsers.length }} résultat(s)</span>
          <span v-else>{{ filteredUsers.length }} membres</span>
        </p>
      </div>
    </div>

    <!-- LISTE DES UTILISATEURS -->
    <div class="results-section">
      <div v-if="loading" class="state-message">
        <i class="pi pi-spin pi-spinner"></i>
        Chargement des utilisateurs...
      </div>
      
      <div v-else-if="error" class="state-message error">
        <i class="pi pi-exclamation-circle"></i>
        {{ error }}
      </div>
      
      <div v-else-if="filteredUsers.length === 0" class="state-message">
        <i class="pi pi-users"></i>
        Aucun utilisateur ne correspond à votre recherche.
      </div>
      
      <div v-else class="users-grid">
        <article 
          v-for="user in filteredUsers" 
          :key="user.id" 
          class="user-card"
          @click="goToProfile(user.id)"
        >
          <div class="user-avatar">
            <img v-if="getAvatar(user)" :src="getAvatar(user)" :alt="user.login" />
            <div v-else class="avatar-placeholder">
              {{ getInitials(user) }}
            </div>
          </div>
          
          <div class="user-info">
            <h3 class="user-name">
              {{ user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.login }}
            </h3>
            <p class="user-login">@{{ user.login }}</p>
            
            <div class="user-badges">
              <span v-if="user.role" class="badge" :class="`badge-${user.role.toLowerCase()}`">
                {{ user.role === 'SUPER_USER' ? 'Super User' : user.role === 'USER' ? 'Utilisateur' : user.role }}
              </span>
              <span v-if="user.memberType" class="badge badge-member">
                {{ memberTypeLabel(user.memberType) }}
              </span>
            </div>
            
            <p class="user-meta">
              <span v-if="user.points !== undefined" class="meta-item">
                <i class="pi pi-star"></i> {{ user.points }} pts
              </span>
              <span class="meta-item">
                <i class="pi pi-calendar"></i> {{ formatDate(user.createdAt) }}
              </span>
            </p>
          </div>
          
          <div class="user-action">
            <i class="pi pi-arrow-right"></i>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, #1a5c9e 0%, #2d7db3 100%);
  padding: 2rem 1rem;
  text-align: center;
}

.header-inner {
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0.9;
  display: inline-block;
  margin-bottom: 1rem;
}

.back-btn:hover {
  opacity: 1;
  text-decoration: underline;
}

.page-titre {
  color: white;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.page-sous-titre {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-size: 1rem;
}

.filters-section {
  max-width: 1000px;
  margin: -1.5rem auto 1.5rem;
  padding: 0 1rem;
}

.filters-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #6b7280;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #1a5c9e;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  min-width: 140px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1a5c9e;
}

.sort-order-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.sort-order-btn:hover {
  background: #f9fafb;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #fecaca;
}

.search-hint {
  margin: 1rem 0 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.results-section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.state-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.state-message.error {
  color: #dc2626;
}

.state-message i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.user-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a5c9e;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-login {
  margin: 0.125rem 0 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
}

.badge-user {
  background: #dbeafe;
  color: #1e40af;
}

.badge-super_user {
  background: #fef3c7;
  color: #92400e;
}

.badge-admin {
  background: #fee2e2;
  color: #991b1b;
}

.badge-member {
  background: #e5e7eb;
  color: #374151;
}

.user-meta {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  display: flex;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item i {
  font-size: 0.7rem;
}

.user-action {
  color: #9ca3af;
  font-size: 0.875rem;
}
</style>
