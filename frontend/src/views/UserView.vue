<template>
  <div class="user-container">
    <div class="user-header">
      <div class="user-avatar">
        <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.firstName" />
        <div v-else class="avatar-placeholder">
          {{ (user.firstName?.[0] || 'U').toUpperCase() }}
        </div>
      </div>
      <div class="user-title">
        <h1>{{ user.firstName }} {{ user.lastName }}</h1>
        <p class="user-role" :class="`role-${user.role?.toLowerCase()}`">
          {{ user.role }}
        </p>
      </div>
      <button class="btn-logout" @click="handleLogout">
        <i class="pi pi-sign-out"></i> Déconnexion
      </button>
    </div>

    <div class="user-content">
      <div class="info-section">
        <h2>Informations personnelles</h2>
        <div class="info-grid">
          <div class="info-card">
            <label>Prénom</label>
            <span>{{ user.firstName || '-' }}</span>
          </div>
          <div class="info-card">
            <label>Nom</label>
            <span>{{ user.lastName || '-' }}</span>
          </div>
          <div class="info-card">
            <label>Login</label>
            <span>{{ user.login }}</span>
          </div>
          <div class="info-card">
            <label>Email</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-card">
            <label>Âge</label>
            <span>{{ user.age || '-' }}</span>
          </div>
          <div class="info-card">
            <label>Sexe</label>
            <span>{{ user.sex === 'M' ? 'Homme' : user.sex === 'F' ? 'Femme' : '-' }}</span>
          </div>
          <div class="info-card">
            <label>Type de membre</label>
            <span>{{ user.memberType || '-' }}</span>
          </div>
          <div class="info-card">
            <label>Rôle</label>
            <span :class="`role-badge role-${user.role?.toLowerCase()}`">{{ user.role }}</span>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h2>Statistiques</h2>
        <div class="stats-grid">
          <button
            type="button"
            class="stat-card stat-card-clickable"
            @click="togglePointsHistory"
          >
            <div class="stat-icon points">
              <i class="pi pi-star-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Points (cliquer pour voir l'historique)</div>
              <div class="stat-value">{{ user.points || 0 }}</div>
            </div>
          </button>
          <div class="stat-card">
            <div class="stat-icon verified">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Vérification</div>
              <div class="stat-value">{{ user.isVerified ? 'Vérifiée' : 'Non vérifiée' }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon date">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Inscrit depuis</div>
              <div class="stat-value">{{ formatDate(user.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div v-if="showPointsHistory" class="points-history">
          <h3>Transactions de points</h3>

          <div v-if="historyLoading" class="history-state">Chargement...</div>

          <div v-else-if="!pointsHistory.length" class="history-state">
            Aucune transaction de points trouvée.
          </div>

          <ul v-else class="history-list">
            <li v-for="transaction in pointsHistory" :key="transaction.id" class="history-item">
              <div class="history-main">
                <span
                  class="history-amount"
                  :class="transaction.amount >= 0 ? 'positive' : 'negative'"
                >
                  {{ transaction.amount >= 0 ? '+' : '' }}{{ transaction.amount }} pts
                </span>
                <span class="history-reason">{{ transaction.reason }}</span>
              </div>
              <span class="history-date">{{ formatDateTime(transaction.createdAt) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="actions-section">
        <h2>Actions</h2>
        <div class="actions-grid">
          <RouterLink to="/profile/edit" class="action-btn">
            <i class="pi pi-pen-to-square"></i>
            Modifier le profil
          </RouterLink>
          <button class="action-btn delete" @click="handleDeleteAccount">
            <i class="pi pi-trash"></i>
            Supprimer le compte
          </button>
        </div>
      </div>
    </div>

    <Alert 
      v-if="errorMessage" 
      :message="errorMessage" 
      type="error"
      @close="errorMessage = ''"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import Alert from '../components/Alert.vue'

const router = useRouter()

const user = ref({
  id: '',
  firstName: '',
  lastName: '',
  login: '',
  email: '',
  age: null,
  sex: '',
  role: '',
  memberType: '',
  points: 0,
  isVerified: false,
  createdAt: new Date(),
  avatarUrl: ''
})

const errorMessage = ref('')
const pointsHistory = ref([])
const historyLoading = ref(false)
const showPointsHistory = ref(false)

onMounted(async () => {
  // Récupérer les infos de l'utilisateur
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    }

    // Optionnel: récupérer les dernières infos du serveur
    const token = localStorage.getItem('token')
    if (token) {
      const response = await fetch('http://localhost:3000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
  }
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchPointsHistory = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  historyLoading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/user/me/points/history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Impossible de récupérer les transactions de points')
    }

    pointsHistory.value = data.pointsHistory || []
  } catch (error) {
    errorMessage.value = error.message || 'Erreur lors de la récupération des transactions'
  } finally {
    historyLoading.value = false
  }
}

const togglePointsHistory = async () => {
  showPointsHistory.value = !showPointsHistory.value

  if (showPointsHistory.value) {
    await fetchPointsHistory()
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const handleDeleteAccount = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
    // TODO: Implémenter la suppression du compte
    errorMessage.value = 'Suppression non encore implémentée'
  }
}
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.user-header {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 30px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-size: 40px;
  font-weight: 700;
}

.user-title {
  flex: 1;
}

.user-title h1 {
  margin: 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
}

.user-role {
  margin: 8px 0 0 0;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
}

.btn-logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.user-content {
  max-width: 1200px;
  margin: 0 auto;
}

.info-section,
.stats-section,
.actions-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.info-section h2,
.stats-section h2,
.actions-section h2 {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-card {
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.info-card label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.info-card span {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.role-user {
  background: #dbeafe;
  color: #1e40af;
}

.role-super_user {
  background: #fed7aa;
  color: #92400e;
}

.role-admin {
  background: #fecaca;
  color: #991b1b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%);
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card-clickable {
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.points {
  background: #fef08a;
  color: #ca8a04;
}

.stat-icon.verified {
  background: #d1fae5;
  color: #059669;
}

.stat-icon.date {
  background: #dbeafe;
  color: #0284c7;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.points-history {
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.points-history h3 {
  margin: 0 0 16px;
  color: #1f2937;
  font-size: 18px;
}

.history-state {
  color: #6b7280;
  font-weight: 600;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.history-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-amount {
  font-weight: 700;
}

.history-amount.positive {
  color: #059669;
}

.history-amount.negative {
  color: #dc2626;
}

.history-reason {
  color: #374151;
  font-size: 14px;
}

.history-date {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  transition: all 0.2s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.action-btn.delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.action-btn.delete:hover {
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

/* Mobile */
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
    padding: 20px;
    gap: 20px;
  }

  .user-title h1 {
    font-size: 24px;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .info-section,
  .stats-section,
  .actions-section {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .history-date {
    white-space: normal;
  }
}
</style>