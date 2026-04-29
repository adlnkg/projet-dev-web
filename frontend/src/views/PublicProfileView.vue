<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DEFAULT_AVATAR } from '../utils/user'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const loading = ref(true)
const error = ref(null)

const avatarUrl = computed(() => user.value?.avatarUrl || user.value?.avatar || DEFAULT_AVATAR)
const displayName = computed(() => {
  if (!user.value) return 'Utilisateur'
  const fullName = `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
  return fullName || user.value.login
})

const createdDate = computed(() => {
  if (!user.value?.createdAt) return null
  return new Date(user.value.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

function genderLabel(value) {
  const labels = { M: 'Homme', F: 'Femme', O: 'Autre' }
  return labels[value] || value || '—'
}

function memberTypeLabel(value) {
  const labels = {
    STUDENT: 'Étudiant',
    STAFF: 'Personnel',
    VISITOR: 'Visiteur',
    ADMIN: 'Administrateur',
  }
  return labels[value] || value || '—'
}

async function loadPublicProfile() {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`http://localhost:3000/api/user/id/${route.params.pseudo}`, { headers })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Profil introuvable')
    }
    user.value = data
  } catch (e) {
    error.value = e.message || 'Impossible de charger ce profil.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPublicProfile)
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.back()">← Retour</button>

    <div v-if="loading" class="state-card">Chargement du profil...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="user" class="profile-card">
      <div class="profile-header">
        <img :src="avatarUrl" :alt="displayName" class="avatar" />
        <div class="header-info">
          <h1>{{ displayName }}</h1>
          <p class="login">@{{ user.login }}</p>
          <div class="badges">
            <span v-if="user.role" class="badge role">{{ user.role }}</span>
            <span v-if="user.memberType" class="badge member">{{ memberTypeLabel(user.memberType) }}</span>
          </div>
          <p v-if="createdDate" class="created">Membre depuis le {{ createdDate }}</p>
        </div>
      </div>

      <div class="profile-grid">
        <section class="panel">
          <h2>Informations</h2>
          <div class="info-grid">
            <div class="info-item" v-if="user.email">
              <span>Email</span>
              <strong>{{ user.email }}</strong>
            </div>
            <div class="info-item">
              <span>Genre</span>
              <strong>{{ genderLabel(user.sex) }}</strong>
            </div>
            <div class="info-item">
              <span>Âge</span>
              <strong>{{ user.age ? `${user.age} ans` : '—' }}</strong>
            </div>
            <div class="info-item">
              <span>Points</span>
              <strong>{{ user.points ?? 0 }}</strong>
            </div>
          </div>
        </section>

        <section class="panel">
          <h2>Résumé</h2>
          <p class="summary-text">
            {{ displayName }} fait partie de la communauté CYTech avec le rôle
            <strong>{{ user.role || '—' }}</strong> et le type de membre
            <strong>{{ memberTypeLabel(user.memberType) }}</strong>.
          </p>
        </section>
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

.profile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(13, 45, 94, 0.08);
}

.profile-header {
  background: linear-gradient(135deg, #1a5c9e 0%, #0d2d5e 100%);
  color: white;
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  flex-shrink: 0;
}

.header-info h1 {
  margin: 0;
  font-size: 30px;
}

.login,
.created {
  margin: 0.3rem 0 0;
  color: #d6e8f7;
  font-size: 13px;
}

.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge.role {
  background: #dbeafe;
  color: #1e40af;
}

.badge.member {
  background: #dcfce7;
  color: #166534;
}

.profile-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
}

.panel h2 {
  margin: 0 0 1rem;
  color: #0d2d5e;
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem;
}

.info-item span {
  display: block;
  font-size: 12px;
  color: #777;
  margin-bottom: 0.35rem;
  font-weight: 700;
  text-transform: uppercase;
}

.info-item strong {
  color: #0d2d5e;
}

.summary-text {
  margin: 0;
  color: #444;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .page-container {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 1.5rem;
  }

  .avatar {
    width: 90px;
    height: 90px;
  }

  .header-info h1 {
    font-size: 22px;
  }

  .profile-grid {
    padding: 1rem;
  }
}
</style>
