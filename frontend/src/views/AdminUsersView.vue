<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fixUser } from '../utils/user'

const router = useRouter()
const users = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

async function fetchUsers() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:3000/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement')
    users.value = data.data?.map(fixUser) || []
  } catch (e) {
    error.value = e.message || 'Erreur lors du chargement des utilisateurs'
  } finally {
    loading.value = false
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.login.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  )
})

import { computed } from 'vue'

onMounted(() => {
  fetchUsers()
})

function goToUserDetail(userId) {
  router.push(`/admin/users/${userId}`)
}

function getRoleColor(role) {
  const colors = {
    ADMIN: '#dc2626',
    SUPER_USER: '#7c3aed',
    USER: '#0891b2',
  }
  return colors[role] || '#6b7280'
}

function getMemberTypeLabel(type) {
  const labels = {
    STUDENT: 'Étudiant',
    STAFF: 'Personnel',
    VISITOR: 'Visiteur',
  }
  return labels[type] || type
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Gestion des utilisateurs</h1>
      <p>{{ filteredUsers.length }} utilisateur(s) trouvé(s)</p>
    </header>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-else-if="loading" class="skeleton-card">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>

    <div v-else class="users-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par login, nom, email..."
          class="search-input"
        />
      </div>

      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Login</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Type</th>
              <th>Rôle</th>
              <th>Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="avatar-cell">
                <img :src="user.avatarUrl" :alt="user.login" class="user-avatar" />
              </td>
              <td class="login-cell">{{ user.login }}</td>
              <td class="name-cell">
                {{ user.firstName }} {{ user.lastName }}
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td class="type-cell">
                <span class="badge badge-type">{{ getMemberTypeLabel(user.memberType) }}</span>
              </td>
              <td class="role-cell">
                <span class="badge" :style="{ backgroundColor: getRoleColor(user.role) }">
                  {{ user.role }}
                </span>
              </td>
              <td class="points-cell">{{ user.points }}</td>
              <td class="actions-cell">
                <button class="btn-view" @click="goToUserDetail(user.id)">Voir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredUsers.length === 0" class="no-data">
        Aucun utilisateur trouvé
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem;
  color: #0d2d5e;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Skeleton */
.skeleton-card {
  padding: 2rem;
}

.skeleton-line {
  height: 20px;
  background: #e5e7eb;
  border-radius: 4px;
  margin: 1rem 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Search */
.search-box {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #1a5c9e;
  box-shadow: 0 0 0 3px rgba(26, 92, 158, 0.1);
}

/* Table */
.users-table-wrapper {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: linear-gradient(135deg, #1a5c9e 0%, #0d2d5e 100%);
  color: white;
}

.users-table th {
  padding: 12px;
  text-align: left;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table td {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
}

.user-row:hover {
  background: #f9fafb;
}

.avatar-cell {
  width: 50px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.login-cell {
  font-weight: 700;
  color: #0d2d5e;
}

.name-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
  font-size: 13px;
}

.type-cell,
.role-cell,
.points-cell {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.badge-type {
  background: #0891b2;
}

.actions-cell {
  text-align: center;
}

.btn-view {
  background: #1a5c9e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-view:hover {
  background: #0d2d5e;
}

.no-data {
  padding: 2rem;
  text-align: center;
  color: #999;
}

/* Responsive */
@media (max-width: 900px) {
  .page-container {
    padding: 1rem;
  }

  .users-table {
    font-size: 12px;
  }

  .users-table th,
  .users-table td {
    padding: 8px;
  }

  .name-cell,
  .email-cell {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .users-table-wrapper {
    overflow-x: auto;
  }

  .users-table {
    min-width: 500px;
  }
}
</style>
