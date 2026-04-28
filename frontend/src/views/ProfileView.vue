<script setup>
import NavBar from '../components/NavBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMe, DEFAULT_AVATAR } from '../utils/user'

const router = useRouter()
const user = ref(null)
const loading = ref(true)
const error = ref(null)

const genderLabels = {
  M: 'Homme',
  F: 'Femme',
  O: 'Autre',
}

const memberTypeLabels = {
  STUDENT: 'Étudiant',
  STAFF: 'Personnel',
  VISITOR: 'Visiteur',
  ADMIN: 'Administrateur',
}

const avatarUrl = computed(() => user.value?.avatarUrl || user.value?.avatar || DEFAULT_AVATAR)
const displayName = computed(() => user.value ? `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.login : 'Utilisateur')
const createdDate = computed(() => {
  if (!user.value?.createdAt) return null
  return new Date(user.value.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
})

onMounted(async () => {
  try {
    const data = await getMe()
    user.value = data
    
    // Récupérer l'historique des points séparément
    const token = localStorage.getItem('token')
    if (token) {
      const historyRes = await fetch('http://localhost:3000/api/user/me/points/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        if (user.value && historyData.pointsHistory) {
          user.value.pointHistory = historyData.pointsHistory
        }
      }
    }
  } catch (e) {
    error.value = e.message || 'Erreur lors du chargement du profil'
  } finally {
    loading.value = false
  }
})

function goToEditProfile() {
  router.push('/profile/edit')
}
</script>

<template>
  <NavBar />
  <div class="page-container">
    <header class="page-header">
      <h1>Mon profil</h1>
    </header>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="loading" class="skeleton-card">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>

    <div v-else-if="user" class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <img :src="avatarUrl" :alt="displayName" class="avatar" />
        </div>
        <div class="header-info">
          <h2>{{ displayName }}</h2>
          <p class="login">@{{ user.login }}</p>
          <p class="member-type">{{ memberTypeLabels[user.memberType] || user.memberType }}</p>
          <div class="role-badge-header" :class="user.role.toLowerCase()">
            {{ user.role }}
          </div>
          <div class="points-badge" v-if="user.points !== undefined">
            <span class="points-value">{{ user.points }}</span>
            <span class="points-label">points</span>
          </div>
        </div>
      </div>

      <div class="profile-details">
        <!-- Informations personnelles -->
        <div class="detail-section">
          <h3>Informations personnelles</h3>
          <div class="details-grid">
            <div class="detail-item">
              <label>Email</label>
              <p><a :href="`mailto:${user.email}`" class="email-link">{{ user.email }}</a></p>
            </div>
            <div class="detail-item">
              <label>Genre</label>
              <p>{{ genderLabels[user.sex] || user.sex || '—' }}</p>
            </div>
            <div class="detail-item">
              <label>Âge</label>
              <p>{{ user.age ? `${user.age} ans` : '—' }}</p>
            </div>
            <div class="detail-item">
              <label>Type de membre</label>
              <p>{{ memberTypeLabels[user.memberType] || user.memberType }}</p>
            </div>
            <div class="detail-item">
              <label>Rôle</label>
              <p>
                <span class="role-badge" :class="user.role.toLowerCase()">{{ user.role }}</span>
              </p>
            </div>
            <div class="detail-item">
              <label>Inscrit depuis</label>
              <p>{{ createdDate }}</p>
            </div>
          </div>
        </div>

        <!-- Système de points -->
        <div class="detail-section">
          <h3>Système de points</h3>
          <div class="points-overview">
            <div class="points-stat">
              <div class="stat-value">{{ user.points || 0 }}</div>
              <div class="stat-label">Points accumulés</div>
            </div>
            <div class="points-info">
              <p>Les utilisateurs gagnent 10 points par connexion quotidienne.</p>
              <p v-if="user.points && user.points >= 100" class="promotion-info">
                ⭐ Vous avez atteint 100 points et êtes promu <strong>SUPER_USER</strong>!
              </p>
              <p v-else class="promotion-info">
                📈 {{ 100 - (user.points || 0) }} points restants pour atteindre SUPER_USER.
              </p>
            </div>
          </div>
        </div>

        <!-- Historique complet des points -->
        <div class="detail-section">
          <h3>Historique complet des transactions</h3>
          <div v-if="!user.pointHistory || user.pointHistory.length === 0" class="no-history">
            Aucune transaction pour le moment.
          </div>
          <div v-else class="history-table-wrapper">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Raison</th>
                  <th>Montant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in user.pointHistory" :key="entry.id" class="history-row">
                  <td class="reason-cell">{{ entry.reason }}</td>
                  <td class="amount-cell" :class="entry.amount > 0 ? 'positive' : 'negative'">
                    {{ entry.amount > 0 ? '+' : '' }}{{ entry.amount }} pts
                  </td>
                  <td class="date-cell">{{ new Date(entry.createdAt).toLocaleDateString('fr-FR') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn-primary" @click="goToEditProfile">Modifier le profil</button>
        <button class="btn-secondary" @click="router.push('/')">Retour à l'accueil</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0; color: #0d2d5e; }

.error-message {
  background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin: 1rem 0;
}

/* Skeleton Loading */
.skeleton-card { padding: 2rem; }
.skeleton-avatar { width: 120px; height: 120px; background: #e5e7eb; border-radius: 50%; margin: 0 auto 1rem; animation: pulse 2s infinite; }
.skeleton-line { height: 20px; background: #e5e7eb; border-radius: 4px; margin: 0.5rem 0; animation: pulse 2s infinite; }
.skeleton-line.short { width: 40%; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Profile Card */
.profile-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }

.profile-header {
  background: linear-gradient(135deg, #1a5c9e 0%, #0d2d5e 100%);
  color: white; padding: 2rem; display: flex; align-items: center; gap: 2rem;
}

.avatar-section { flex-shrink: 0; }
.avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid white; }

.header-info { flex: 1; }
.header-info h2 { margin: 0 0 0.25rem; font-size: 24px; }
.login { margin: 0 0 0.5rem; font-size: 14px; color: #d6e8f7; }
.member-type { margin: 0 0 0.5rem; font-size: 13px; color: #a8c8e1; font-weight: 600; }

.role-badge-header {
  display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 0.5rem;
}
.role-badge-header.admin { background: #dbeafe; color: #1a5c9e; }
.role-badge-header.super_user { background: #dcfce7; color: #15803d; }
.role-badge-header.user { background: #f3e8ff; color: #7c3aed; }

.points-badge { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; width: fit-content; }
.points-value { font-size: 16px; }

/* Details */
.profile-details { padding: 2rem; border-top: 1px solid #f0f0f0; }

.detail-section { margin-bottom: 2.5rem; }
.detail-section h3 { margin: 0 0 1rem; color: #0d2d5e; font-size: 16px; font-weight: 700; }
.detail-section:last-of-type { margin-bottom: 0; }

.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.detail-item { padding: 1rem; background: #f9fafb; border-radius: 8px; }
.detail-item label { display: block; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
.detail-item p { margin: 0; color: #333; }
.detail-item .mono { font-family: 'Courier New', monospace; font-size: 12px; }
.email-link { color: #1a5c9e; text-decoration: none; }
.email-link:hover { text-decoration: underline; }

.role-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.role-badge.admin { background: #dbeafe; color: #1a5c9e; }
.role-badge.super_user { background: #dcfce7; color: #15803d; }
.role-badge.user { background: #f3e8ff; color: #7c3aed; }

/* Points Overview */
.points-overview { display: grid; grid-template-columns: auto 1fr; gap: 2rem; align-items: center; background: #f9fafb; padding: 1.5rem; border-radius: 8px; }
.points-stat { text-align: center; }
.stat-value { font-size: 36px; font-weight: 800; color: #1a5c9e; }
.stat-label { font-size: 14px; color: #666; margin-top: 0.25rem; }
.points-info p { margin: 0.5rem 0; color: #666; font-size: 14px; }
.points-info p:first-child { margin-top: 0; }
.promotion-info { color: #15803d; font-weight: 600; }

/* Points History */
.points-history { background: #f9fafb; padding: 1rem; border-radius: 8px; }
.history-list { display: flex; flex-direction: column; gap: 0.75rem; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: white; border-radius: 6px; border-left: 3px solid #1a5c9e; }
.history-left { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
.history-reason { font-size: 14px; font-weight: 600; color: #333; }
.history-date { font-size: 12px; color: #999; }
.history-amount { font-weight: 700; min-width: 70px; text-align: right; }
.history-amount.positive { color: #15803d; }
.history-amount.negative { color: #c41d1d; }

/* History Table */
.history-table-wrapper { 
  overflow-x: auto; 
  background: #f9fafb; 
  border-radius: 8px; 
  border: 1px solid #e5e7eb;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}
.history-table thead {
  background: #f3f4f6;
  border-bottom: 2px solid #e5e7eb;
}
.history-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 12px;
  color: #666;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.history-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.history-table tbody tr:hover {
  background: #f9fafb;
}
.history-table td {
  padding: 12px 16px;
  font-size: 14px;
}
.reason-cell { color: #333; font-weight: 500; }
.amount-cell { font-weight: 700; text-align: right; }
.amount-cell.positive { color: #15803d; }
.amount-cell.negative { color: #c41d1d; }
.date-cell { color: #999; font-size: 13px; }
.no-history { padding: 1.5rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; color: #999; }

@media (max-width: 480px) {
  .history-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .history-table th,
  .history-table td {
    padding: 10px 12px;
    font-size: 12px;
  }
}

/* Actions */
.profile-actions { padding: 2rem; border-top: 1px solid #f0f0f0; display: flex; gap: 1rem; }
.btn-primary { background: #1a5c9e; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: background 0.2s; }
.btn-primary:hover { background: #0d2d5e; }
.btn-secondary { background: white; color: #1a5c9e; border: 2px solid #1a5c9e; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
.btn-secondary:hover { background: #f0f5ff; }

/* Responsive */
@media (max-width: 900px) {
  .page-container { padding: 1rem; }
  .profile-header { flex-direction: column; text-align: center; gap: 1rem; }
  .avatar { width: 100px; height: 100px; }
  .details-grid { grid-template-columns: 1fr; }
  .profile-actions { flex-direction: column; }
  .points-overview { grid-template-columns: 1fr; gap: 1rem; }
}

@media (max-width: 480px) {
  .page-container { padding: 1rem; }
  .page-header h1 { font-size: 20px; }
  .header-info h2 { font-size: 20px; }
  .avatar { width: 80px; height: 80px; }
  .profile-header { padding: 1.5rem; }
  .profile-details { padding: 1.5rem; }
  .profile-actions { padding: 1.5rem; gap: 0.5rem; }
  .stat-value { font-size: 28px; }
}
</style>
