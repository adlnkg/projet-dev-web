<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EntityForm from '../components/EntityForm.vue'
import { buildFormState, buildUpdatePayload } from '../utils/entityForm'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)
const actionMessage = ref('')
const deletionLoading = ref(false)
const deletionMessage = ref('')
const isEditing = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editSuccess = ref('')
const formValues = ref({})

const registeredUsers = computed(() => event.value?.registrations?.map((registration) => registration.user).filter(Boolean) ?? [])
const canEdit = computed(() => Boolean(event.value?.form?.editableFieldKeys?.length))
const userRole = computed(() => event.value?.form?.role || '')
const canRequestDeletion = computed(() => ['SUPER_USER', 'ADMIN'].includes(userRole.value))
const isAdmin = computed(() => userRole.value === 'ADMIN')
const imageUrl = computed(() => {
  const value = isEditing.value ? formValues.value.imageUrl : event.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80'
})

function goToProfile(login) {
  if (!login) return
  router.push(`/profile/${login}`)
}

function goToArea(areaId) {
  if (!areaId) return
  router.push(`/zones/${areaId}`)
}

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

function syncFormState(resource) {
  formValues.value = buildFormState(resource?.form?.fields ?? [])
}

function startEditing() {
  if (!canEdit.value || !event.value) return
  editError.value = ''
  editSuccess.value = ''
  syncFormState(event.value)
  isEditing.value = true
}

function cancelEditing() {
  if (event.value) {
    syncFormState(event.value)
  }
  editError.value = ''
  editSuccess.value = ''
  isEditing.value = false
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
    syncFormState(data.data)
  } catch (e) {
    error.value = e.message || 'Impossible de charger l’événement.'
  } finally {
    loading.value = false
  }
}

async function saveEvent() {
  if (!event.value) return
  editLoading.value = true
  editError.value = ''
  editSuccess.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise pour modifier cet événement.')

    const payload = buildUpdatePayload(event.value.form.fields, formValues.value)
    const wasRegistered = event.value.userIsRegistered

    const res = await fetch(`http://localhost:3000/api/events/${route.params.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Mise à jour impossible')
    }

    event.value = data.data
    if (wasRegistered) {
      event.value.userIsRegistered = true
    }
    syncFormState(data.data)
    isEditing.value = false
    editSuccess.value = data.message || 'Événement mis à jour.'
  } catch (e) {
    editError.value = e.message || 'Impossible de mettre à jour l’événement.'
  } finally {
    editLoading.value = false
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
   const shouldDelete = isAdmin.value
    const confirmed = shouldDelete
      ? confirm('Supprimer définitivement cet événement ? Cette action est irréversible.')
      : confirm('Envoyer une demande de suppression de cet événement à un administrateur ?')
    if (!confirmed) return

    const endpoint = shouldDelete
      ? `http://localhost:3000/api/events/${route.params.id}`
      : `http://localhost:3000/api/events/${route.params.id}/deletion-request`
    const method = shouldDelete ? 'DELETE' : 'POST'

    const res = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Demande impossible')
    if (isAdmin.value) {
      deletionMessage.value = 'Événement supprimé.'
      setTimeout(() => router.push({ path: '/recherche', query: { category: 'event' } }), 600)
    } else {
      deletionMessage.value = 'Demande envoyée aux administrateurs.'
    }
  } catch (e) {
    deletionMessage.value = e.message || 'Erreur lors de la demande.'
  } finally {
    deletionLoading.value = false
  }
}

onMounted(loadEvent)
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.push({ path: '/recherche', query: { category: 'event' } })">← Retour aux événements</button>

    <div v-if="loading" class="state-card">Chargement de l’événement...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="event" class="detail-card">
      <div class="hero">
        <img :src="imageUrl" :alt="event.title" class="hero-img" />
        <div class="hero-overlay">
          <div class="hero-actions">
            <button v-if="canEdit && !isEditing" class="ghost-btn" @click="startEditing">Modifier</button>
            <button v-else-if="canEdit && isEditing" class="ghost-btn" @click="cancelEditing">Voir</button>
            <button
              v-if="canRequestDeletion"
              class="delete-request-btn"
              :disabled="deletionLoading"
              @click="requestDeletion"
              title="Demander la suppression"
            >
              {{ isAdmin ? 'Supprimer' : '✕' }}
            </button>
          </div>
          <div class="meta-row">
            <span v-if="event.type" class="pill">{{ event.type }}</span>
            <span class="date">{{ formatDateTime(event.startTime) }}</span>
            <span v-if="event.userIsRegistered && !isEditing" class="pill registered">Déjà inscrit</span>
          </div>
          <h1>{{ event.title }}</h1>
          <p v-if="event.organizer" class="author">Organisé par {{ event.organizer }}</p>
          <p v-if="deletionMessage" class="action-message">{{ deletionMessage }}</p>
        </div>
      </div>

      <div v-if="!isEditing" class="content-grid">
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
            <strong class="link-like" @click="goToArea(event.area?.id || event.areaId)">{{ event.area?.name || event.areaName }}</strong>
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

      <div v-else class="content-grid edit-grid">
        <section class="content-panel edit-panel">
          <EntityForm
            v-model="formValues"
            :fields="event.form.fields"
            title="Modifier l'événement"
            description="Le formulaire est généré à partir des métadonnées renvoyées par l'API."
            submit-label="Enregistrer"
            :loading="editLoading"
            :error="editError"
            :success="editSuccess"
            @submit="saveEvent"
            @cancel="cancelEditing"
          />
        </section>

        <aside class="side-panel">
          <h3>Aperçu</h3>
          <div class="info-item">
            <span>Début</span>
            <strong>{{ formatDateTime(formValues.startTime || event.startTime) }}</strong>
          </div>
          <div class="info-item">
            <span>Fin</span>
            <strong>{{ formatDateTime(formValues.endTime || event.endTime) }}</strong>
          </div>
          <div class="info-item">
            <span>Capacité</span>
            <strong>{{ formValues.maxParticipants || event.maxParticipants }} personnes</strong>
          </div>
          <div class="info-item">
            <span>Prix</span>
            <strong>{{ formatPrice(formValues.price ?? event.price) }}</strong>
          </div>
        </aside>
      </div>

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

.hero-actions {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border-radius: 999px;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.delete-request-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(220, 38, 38, 0.9);
  color: white;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 0 0.85rem;
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
  color: #d6e8f7;
}

.action-message.danger {
  color: #fecaca;
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

.link-like {
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
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
