<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMe } from '../utils/user'

const route = useRoute()
const router = useRouter()
const device = ref(null)
const loading = ref(true)
const error = ref('')
const deletionLoading = ref(false)
const deletionMessage = ref('')
const currentUserRole = ref('')
const adminForm = ref({ name: '', description: '', status: 'ACTIVE', areaId: '' })
const adminMessage = ref('')
const adminSaving = ref(false)

const imageUrl = computed(() => {
  const value = device.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80'
})

const historyEntries = computed(() => device.value?.history?.entries ?? [])

const historySummary = computed(() => {
  const count = device.value?.history?.count ?? 0
  return count > 0 ? `${count} modification${count > 1 ? 's' : ''}` : 'Aucune modification enregistrée'
})

function formatDate(value) {
  if (!value) return 'Date inconnue'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHistoryValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

async function loadDevice() {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise pour accéder aux objets connectés.')

    const res = await fetch(`http://localhost:3000/api/devices/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || 'Objet introuvable')
    device.value = data.data
    adminForm.value = {
      name: data.data.name ?? '',
      description: data.data.description ?? '',
      status: data.data.status ?? 'ACTIVE',
      areaId: data.data.areaId ?? '',
    }
  } catch (e) {
    error.value = e.message || 'Impossible de charger cet objet connecté.'
  } finally {
    loading.value = false
  }
}

async function saveAdminEdits() {
  adminMessage.value = ''
  adminSaving.value = true
  try {
    const token = localStorage.getItem('token')
    const payload = {
      name: adminForm.value.name,
      description: adminForm.value.description,
      status: adminForm.value.status,
      areaId: adminForm.value.areaId === '' ? null : Number(adminForm.value.areaId),
    }
    const res = await fetch(`http://localhost:3000/api/devices/${route.params.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Mise à jour impossible')
    device.value = data.data
    adminMessage.value = 'Objet connecté mis à jour.'
  } catch (e) {
    adminMessage.value = e.message || 'Erreur lors de la mise à jour.'
  } finally {
    adminSaving.value = false
  }
}

async function requestDeletion() {
  deletionLoading.value = true
  deletionMessage.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise.')
    if (!confirm('Envoyer une demande de suppression de cet objet connecté à un administrateur ?')) return

    const res = await fetch(`http://localhost:3000/api/devices/${route.params.id}/deletion-request`, {
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

onMounted(loadDevice)
onMounted(async () => {
  try {
    const me = await getMe()
    currentUserRole.value = me.role || ''
  } catch (_) {}
})
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.push('/recherche?category=device')">← Retour aux objets</button>

    <div v-if="loading" class="state-card">Chargement de l'objet connecté...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="device" class="detail-card">
      <div class="hero">
        <img :src="imageUrl" :alt="device.name" class="hero-img" />
        <div class="hero-overlay">
          <h1>{{ device.name }}</h1>
          <p v-if="device.type" class="subtitle">Type : {{ device.type }}</p>
        </div>
      </div>

      <section class="content-panel">
        <h2>Description</h2>
        <p>{{ device.description || 'Aucune description disponible.' }}</p>
      </section>

      <section class="content-panel history-panel">
        <div class="history-header">
          <h2>Historique</h2>
          <p>{{ historySummary }}</p>
        </div>

        <p v-if="historyEntries.length === 0" class="history-empty">
          Aucun historique disponible pour cet objet connecté.
        </p>

        <ul v-else class="history-list">
          <li v-for="entry in historyEntries" :key="entry.id" class="history-item">
            <div class="history-item-head">
              <strong>{{ entry.label || entry.fieldKey }}</strong>
              <span>{{ formatDate(entry.recordedAt) }}</span>
            </div>
            <p class="history-kind">Type : {{ entry.kind }}</p>
            <p class="history-values">
              <span>Avant : {{ formatHistoryValue(entry.previousValue) }}</span>
              <span>Après : {{ formatHistoryValue(entry.currentValue) }}</span>
            </p>
          </li>
        </ul>
      </section>

      <section
        v-if="currentUserRole === 'SUPER_USER' || currentUserRole === 'ADMIN'"
        class="deletion-request-panel"
      >
        <h3>Demande de suppression</h3>
        <p>Cette action envoie une demande de suppression aux administrateurs.</p>
        <button class="deletion-request-action" :disabled="deletionLoading" @click="requestDeletion">
          {{ deletionLoading ? 'Envoi...' : 'Demander la suppression' }}
        </button>
        <p v-if="deletionMessage" class="action-message">{{ deletionMessage }}</p>
      </section>

      <section v-if="currentUserRole === 'ADMIN'" class="admin-edit-panel">
        <h3>Modification admin</h3>
        <div class="form-grid">
          <label>Nom <input v-model="adminForm.name" type="text" /></label>
          <label>Description <textarea v-model="adminForm.description" rows="3" /></label>
          <label>Statut
            <select v-model="adminForm.status">
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Désactivé</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </label>
          <label>ID du bâtiment/zone
            <input v-model="adminForm.areaId" type="number" min="1" placeholder="Ex: 12" />
          </label>
        </div>
        <button class="admin-save-btn" :disabled="adminSaving" @click="saveAdminEdits">
          {{ adminSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
        </button>
        <p v-if="adminMessage" class="action-message">{{ adminMessage }}</p>
      </section>
    </article>
  </main>
</template>

<style scoped>
.page-container { max-width: 980px; margin: 0 auto; padding: 2rem; }
.back-btn { background: transparent; border: none; color: #1a5c9e; font-weight: 700; cursor: pointer; margin-bottom: 1rem; }
.state-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; color: #555; }
.state-card.error { color: #b91c1c; background: #fef2f2; }
.detail-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
.hero { position: relative; }
.hero-img { width: 100%; max-height: 360px; object-fit: cover; display: block; }
.hero-overlay { position: absolute; inset: auto 0 0 0; background: linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,0)); color: white; padding: 2rem; }
.hero-overlay h1 { margin: 0; }
.subtitle { margin-top: .5rem; color: #d6e8f7; }
.content-panel { padding: 1.5rem; }
.history-panel { border-top: 1px solid #e5e7eb; }
.history-header { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.history-header p { margin: 0; color: #64748b; font-weight: 600; }
.history-empty { margin-top: .75rem; color: #6b7280; }
.history-list { list-style: none; padding: 0; margin: .75rem 0 0; display: grid; gap: .75rem; }
.history-item { border: 1px solid #e5e7eb; border-radius: 10px; padding: .9rem; background: #f8fafc; }
.history-item-head { display: flex; justify-content: space-between; gap: 1rem; font-size: .95rem; }
.history-item-head span { color: #64748b; }
.history-kind { margin: .4rem 0 0; color: #334155; font-size: .9rem; }
.history-values { margin: .5rem 0 0; display: grid; gap: .2rem; font-size: .92rem; }
.deletion-request-panel { margin: 1.5rem; margin-top: 0; border: 1px solid #fca5a5; background: #fef2f2; border-radius: 12px; padding: 1rem; color: #991b1b; }
.deletion-request-panel h3 { margin: 0 0 .5rem; }
.deletion-request-panel p { margin: 0; }
.deletion-request-action { margin-top: .75rem; border: none; border-radius: 8px; background: #dc2626; color: white; padding: .65rem 1rem; font-weight: 700; cursor: pointer; }
.deletion-request-action:disabled { opacity: .6; cursor: not-allowed; }
.action-message { margin-top: .75rem; font-weight: 600; }
.admin-edit-panel { margin: 1.5rem; margin-top: 0; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 12px; padding: 1rem; }
.form-grid { display: grid; gap: .75rem; }
.form-grid label { display: grid; gap: .25rem; font-weight: 600; color: #1e3a8a; }
.form-grid input, .form-grid textarea, .form-grid select { border: 1px solid #93c5fd; border-radius: 8px; padding: .5rem; font: inherit; }
.admin-save-btn { margin-top: .75rem; border: none; border-radius: 8px; background: #2563eb; color: white; padding: .65rem 1rem; font-weight: 700; cursor: pointer; }
.admin-save-btn:disabled { opacity: .6; cursor: not-allowed; }
</style>