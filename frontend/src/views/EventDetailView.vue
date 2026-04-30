<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMe } from '../utils/user'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)
const actionMessage = ref('')
const deletionLoading = ref(false)
const deletionMessage = ref('')
const currentUserRole = ref('')


const registeredUsers = computed(() => event.value?.registrations?.map((registration) => registration.user).filter(Boolean) ?? [])

function goToProfile(login) {
  if (!login) return
  router.push(`/profile/${login}`)
}

const imageUrl = computed(() => {
  const value = event.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80'
})

function formatDateTime(value) {
  if (!value) return 'Date inconnue'
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(value) {
  if (value === null || value === undefined) return 'Non précisé'
  if (Number(value) === 0) return 'Gratuit'
  return `${value} €`
}

async function loadEvent() {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`http://localhost:3000/api/events/${route.params.id}`, { headers })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Événement introuvable')
    }
    event.value = data.data
  } catch (e) {
    error.value = e.message || 'Impossible de charger l’événement.'
  } finally {
    loading.value = false
  }
}

async function toggleRegistration() {
  if (!event.value) return
  actionLoading.value = true
  actionMessage.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Connexion requise pour participer.')
    }

    const endpoint = event.value.userIsRegistered ? 'unregister' : 'register'
    const res = await fetch(`http://localhost:3000/api/events/${route.params.id}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Action impossible')
    }
    actionMessage.value = data.message
    event.value.userIsRegistered = !event.value.userIsRegistered
  } catch (e) {
    actionMessage.value = e.message || 'Action impossible.'
  } finally {
    actionLoading.value = false
  }
}

async function requestDeletion() {
  if (!event.value) return
  deletionLoading.value = true
  deletionMessage.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise.')
    if (!confirm('Envoyer une demande de suppression de cet événement à un administrateur ?')) return

    const res = await fetch(`http://localhost:3000/api/events/${route.params.id}/deletion-request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Demande impossible')
    deletionMessage.value = 'Demande envoyée aux administrateurs.'
  } catch (e) {
    deletionMessage.value = e.message || 'Erreur lors de la demande.'
  } finally {
    deletionLoading.value = false
  }
}


onMounted(loadEvent)
onMounted(async () => {
  try {
    const me = await getMe()
    currentUserRole.value = me.role || ''
  } catch (_) {}
})
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.push('/evenements')">← Retour aux événements</button>

    <div v-if="loading" class="state-card">Chargement de l’événement...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="event" class="detail-card">
      <div class="hero">
        <img :src="imageUrl" :alt="event.title" class="hero-img" />
        <div class="hero-overlay">
          <div class="meta-row">
            <span v-if="event.type" class="pill">{{ event.type }}</span>
            <span class="date">{{ formatDateTime(event.startTime) }}</span>
            <span v-if="event.userIsRegistered" class="pill registered">Déjà inscrit</span>
          </div>         
          <h1>{{ event.title }}</h1>
          <p v-if="event.organizer" class="author">Organisé par {{ event.organizer }}</p>
        </div>
      </div>

      <div class="content-grid">
        <section class="content-panel">
          <h2>Description</h2>
          <p class="content-text">{{ event.description }}</p>

          <div class="registration-block">
            <button class="btn-primary" :disabled="actionLoading" @click="toggleRegistration">
              {{ actionLoading ? 'Chargement...' : (event.userIsRegistered ? 'Me désinscrire' : 'Je m’inscris') }}
            </button>
            <p v-if="actionMessage" class="action-message">{{ actionMessage }}</p>
          </div>
        </section>

        <aside class="side-panel">
          <h3>Informations</h3>
          <div class="info-item">
            <span>Début</span>
            <strong>{{ formatDateTime(event.startTime) }}</strong>
          </div>
          <div class="info-item">
            <span>Fin</span>
            <strong>{{ formatDateTime(event.endTime) }}</strong>
          </div>
          <div class="info-item" v-if="event.area?.name || event.areaName">
            <span>Lieu</span>
            <strong>{{ event.area?.name || event.areaName }}</strong>
          </div>
          <div class="info-item" v-if="event.maxParticipants !== undefined">
            <span>Capacité</span>
            <strong>{{ event.maxParticipants }} personnes</strong>
          </div>
          <div class="info-item">
            <span>Inscrits</span>
            <strong>{{ event.numberOfParticipants ?? registeredUsers.length }} personnes</strong>
          </div>
          <div class="info-item" v-if="event.price !== undefined">
            <span>Prix</span>
            <strong>{{ formatPrice(event.price) }}</strong>
          </div>
          <div class="info-item" v-if="event.organizer">
            <span>Organisateur</span>
            <strong>{{ event.organizer }}</strong>
          </div>
          <div class="info-item" v-if="event.owner?.login || event.ownerName">
            <span>Auteur</span>
            <strong>{{ event.owner?.firstName || event.ownerName || event.owner?.login }}</strong>
          </div>
          <div class="info-item" v-if="event.specific && Object.keys(event.specific).length > 0">
            <span>Détails complémentaires</span>
            <pre>{{ JSON.stringify(event.specific, null, 2) }}</pre>
          </div>
        </aside>
      </div>
      <section
        v-if="currentUserRole === 'SUPER_USER' || currentUserRole === 'ADMIN'"
        class="deletion-request-panel"
      >
        <h3>Demande de suppression</h3>
        <p>Cette action envoie une demande de suppression aux administrateurs.</p>
        <button class="deletion-request-action" :disabled="deletionLoading" @click="requestDeletion">
          {{ deletionLoading ? 'Envoi...' : 'Demander la suppression' }}
        </button>
        <p v-if="deletionMessage" class="action-message danger">{{ deletionMessage }}</p>
      </section>

      <section class="participants-section">
        <div class="participants-header">
          <h2>Participants inscrits</h2>
          <span class="participants-count">{{ registeredUsers.length }} profil{{ registeredUsers.length > 1 ? 's' : '' }}</span>
        </div>

        <div v-if="registeredUsers.length > 0" class="participants-grid">
          <article v-for="participant in registeredUsers" :key="participant.id" class="participant-card" @click="goToProfile(participant.login)">
            <img
              :src="participant.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/266/266033.png'"
              :alt="participant.login"
              class="participant-avatar"
            />
            <div class="participant-body">
              <h3>{{ participant.firstName || participant.login }} {{ participant.lastName || '' }}</h3>
              <p>@{{ participant.login }}</p>
              <div class="participant-badges">
                <span v-if="participant.role" class="mini-badge">{{ participant.role }}</span>
                <span v-if="participant.memberType" class="mini-badge secondary">{{ participant.memberType }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="participants-empty">
          Aucun participant inscrit pour le moment.
        </div>
      </section>
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

.detail-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(13, 45, 94, 0.08);
}

.hero {
  position: relative;
}

.hero-img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: auto 0 0 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0));
  color: white;
  padding: 2rem;
}

.meta-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.pill {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.pill.registered {
  background: #dcfce7;
  color: #166534;
}

.date,
.author {
  color: #d6e8f7;
  font-size: 13px;
}

.deletion-request-panel {
  margin: 0 1.5rem 1.5rem;
  border: 1px solid #fca5a5;
  background: #fef2f2;
  color: #991b1b;
  border-radius: 12px;
  padding: 1rem;
}

.deletion-request-action {
  margin-top: .75rem;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  padding: .65rem 1rem;
  font-weight: 700;
  cursor: pointer;
  }

.deletion-request-action:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.hero-overlay h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
}

.participants-section {
  padding: 0 1.5rem 1.5rem;
}

.participants-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.participants-header h2 {
  margin: 0;
  color: #0d2d5e;
  font-size: 20px;
}

.participants-count {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.participant-card {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem;
  background: #fafcff;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.participant-card:hover {
  box-shadow: 0 8px 20px rgba(26, 92, 158, 0.1);
  transform: translateY(-2px);
}

.participant-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.participant-body h3 {
  margin: 0;
  font-size: 15px;
  color: #0d2d5e;
}

.participant-body p {
  margin: 0.2rem 0 0.5rem;
  font-size: 12px;
  color: #666;
}

.participant-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.mini-badge {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: #dbeafe;
  color: #1e40af;
}

.mini-badge.secondary {
  background: #e0f2fe;
  color: #0369a1;
}

.participants-empty {
  border: 1px dashed #d1d5db;
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
  color: #777;
  background: #fafafa;
}

.content-panel,
.side-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
}

.content-panel h2,
.side-panel h3 {
  margin: 0 0 1rem;
  color: #0d2d5e;
}

.content-text {
  white-space: pre-line;
  line-height: 1.7;
  color: #444;
}

.registration-block {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f0f0f0;
}

.btn-primary {
  background: #1a5c9e;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-message {
  margin-top: 0.75rem;
  font-size: 13px;
  color: #0d2d5e;
}

.action-message.danger {
  color: #991b1b;
}

.info-item {
  display: grid;
  gap: 0.25rem;
  padding: 0.85rem 0;
  border-top: 1px solid #f0f0f0;
}

.info-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.info-item span {
  font-size: 12px;
  color: #777;
}

.info-item strong {
  color: #0d2d5e;
}

.info-item pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  color: #555;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 10px;
  overflow: auto;
}

@media (max-width: 900px) {
  .page-container {
    padding: 1rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-overlay h1 {
    font-size: 26px;
  }

  .participants-section {
    padding: 0 1rem 1rem;
  }
}

@media (max-width: 480px) {
  .hero-overlay {
    padding: 1rem;
  }

  .hero-overlay h1 {
    font-size: 22px;
  }

  .content-grid {
    padding: 1rem;
  }

  .participants-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
