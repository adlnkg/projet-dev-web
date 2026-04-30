<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EntityForm from '../components/EntityForm.vue'
import { buildFormState, buildUpdatePayload, getFieldDisplayValue } from '../utils/entityForm'

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

const canEdit = computed(() => Boolean(device.value?.form?.editableFieldKeys?.length))
const canRequestDeletion = computed(() => ['SUPER_USER', 'ADMIN'].includes(device.value?.form?.role || ''))
const imageUrl = computed(() => {
  const value = isEditing.value ? formValues.value.imageUrl : device.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80'
})

function syncFormState(resource) {
  formValues.value = buildFormState(resource?.form?.fields ?? [])
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

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === '') return 'Non renseigné'
  return Number(value).toLocaleString('fr-FR', {
    maximumFractionDigits: digits,
  })
}

function startEditing() {
  if (!canEdit.value || !device.value) return
  editError.value = ''
  editSuccess.value = ''
  syncFormState(device.value)
  isEditing.value = true
}

function cancelEditing() {
  if (device.value) {
    syncFormState(device.value)
  }
  editError.value = ''
  editSuccess.value = ''
  isEditing.value = false
}

function goToArea() {
  if (!device.value?.area?.id) return
  router.push({ name: 'area-detail', params: { id: device.value.area.id } })
}

function goToProfile(login) {
  if (!login) return
  router.push(`/profile/${login}`)
}

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
              ✕
            </button>
          </div>
          <div class="meta-row">
            <span v-if="device.type" class="pill">{{ device.type }}</span>
            <span v-if="device.status" class="pill status-pill">{{ device.status }}</span>
          </div>
          <h1>{{ device.name }}</h1>
          <p v-if="device.brand || device.model" class="subtitle">{{ [device.brand, device.model].filter(Boolean).join(' · ') }}</p>
          <p v-if="deletionMessage" class="action-message">{{ deletionMessage }}</p>
        </div>
      </div>

      <div v-if="!isEditing" class="content-grid">
        <section class="content-panel">
          <h2>Description</h2>
          <p class="content-text">{{ device.description || 'Aucune description disponible.' }}</p>

          <div class="stats-grid">
            <div class="stat-card">
              <span>Consommation électrique</span>
              <strong>{{ formatNumber(device.electricityConsumption, 2) }} kWh</strong>
            </div>
            <div class="stat-card" v-if="device.statistics?.consumption?.estimatedDailyConsumptionKwh !== undefined">
              <span>Conso estimée / jour</span>
              <strong>{{ formatNumber(device.statistics.consumption.estimatedDailyConsumptionKwh, 3) }} kWh</strong>
            </div>
            <div class="stat-card" v-if="device.statistics?.maintenance">
              <span>Maintenance</span>
              <strong>{{ device.statistics.maintenance.maintenanceRequired ? 'Requise' : 'À jour' }}</strong>
            </div>
            <div class="stat-card" v-if="device.statistics?.history">
              <span>Historique</span>
              <strong>{{ device.statistics.history.entriesCount ?? device.history?.count ?? 0 }} entrées</strong>
            </div>
          </div>
        </section>

        <aside class="side-panel">
          <h3>Informations</h3>
          <div class="info-item">
            <span>Identifiant unique</span>
            <strong>{{ device.uniqueName }}</strong>
          </div>
          <div class="info-item">
            <span>Type</span>
            <strong>{{ device.type }}</strong>
          </div>
          <div class="info-item" v-if="device.area?.id">
            <span>Zone</span>
            <RouterLink class="link-like" :to="{ name: 'area-detail', params: { id: device.area.id } }">
              {{ device.area.name }}
            </RouterLink>
          </div>
          <div class="info-item" v-if="device.owner?.login || device.ownerName">
            <span>Auteur</span>
            <strong class="link-like" @click="goToProfile(device.owner?.login || device.ownerName)">{{ device.owner?.firstName || device.ownerName || device.owner?.login }}</strong>
          </div>
          <div class="info-item" v-if="device.form?.fields?.some(f => f.section === 'specific')">
            <span>Valeurs spécifiques</span>
            <div>
              <div v-for="field in device.form.fields.filter(f => f.section === 'specific')" :key="field.key" style="margin-bottom:0.5rem;">
                <small style="color:#6b7280">{{ field.label }}</small>
                <div class="field-value" style="margin-top:0.25rem">{{ getFieldDisplayValue(field) }}</div>
              </div>
            </div>
          </div>
          <div class="info-item" v-if="device.statistics?.lifecycle">
            <span>Dernière activité</span>
            <strong>{{ formatDateTime(device.statistics.lifecycle.lastActivityAt) }}</strong>
          </div>
          <div class="info-item" v-if="device.statistics?.maintenance">
            <span>Dernière maintenance</span>
            <strong>{{ formatDateTime(device.statistics.maintenance.lastMaintenanceAt) }}</strong>
          </div>
        </aside>
      </div>

      <div v-else class="content-grid edit-grid">
        <section class="content-panel edit-panel">
          <EntityForm
            v-model="formValues"
            :fields="device.form.fields"
            title="Modifier l'appareil"
            description="Les valeurs non modifiables sont conservées à titre informatif."
            submit-label="Enregistrer"
            :loading="editLoading"
            :error="editError"
            :success="editSuccess"
            @submit="saveDevice"
            @cancel="cancelEditing"
          />
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

        <aside class="side-panel">
          <h3>Aperçu</h3>
          <div class="info-item">
            <span>Zone</span>
            <strong>{{ device.area?.name || 'Non renseignée' }}</strong>
          </div>
          <div class="info-item">
            <span>Statut</span>
            <strong>{{ formValues.status || device.status }}</strong>
          </div>
          <div class="info-item">
            <span>Consommation</span>
            <strong>{{ formatNumber(formValues.electricityConsumption ?? device.electricityConsumption, 2) }} kWh</strong>
          </div>
          <div class="info-item">
            <span>Historique</span>
            <strong>{{ device.history?.count ?? 0 }} entrées</strong>
          </div>
          <div class="info-item" v-if="deletionMessage">
            <span>Suppression</span>
            <strong>{{ deletionMessage }}</strong>
          </div>
        </aside>
      </div>

      <section class="history-section">
        <div class="section-header">
          <h2>Historique</h2>
          <span>{{ device.history?.count ?? 0 }} événement{{ (device.history?.count ?? 0) > 1 ? 's' : '' }}</span>
        </div>

        <div v-if="device.history?.entries?.length" class="history-list">
          <article v-for="entry in device.history.entries" :key="entry.id" class="history-item">
            <div>
              <strong>{{ entry.kind }}</strong>
              <p>{{ entry.fieldKey }}</p>
            </div>
            <div class="history-values">
              <span>{{ entry.previousValue ?? '—' }}</span>
              <span>→</span>
              <span>{{ entry.currentValue ?? '—' }}</span>
            </div>
            <small>{{ formatDateTime(entry.recordedAt) }}</small>
          </article>
        </div>

        <div v-else class="history-empty">Aucune entrée d'historique disponible.</div>
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
.page-container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
.back-btn { background: transparent; border: none; color: #1a5c9e; font-weight: 700; cursor: pointer; margin-bottom: 1rem; }
.state-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; color: #555; }
.state-card.error { color: #b91c1c; background: #fef2f2; }
.detail-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(13, 45, 94, 0.08); }
.hero { position: relative; }
.hero-img { width: 100%; max-height: 420px; object-fit: cover; display: block; }
.hero-overlay { position: absolute; inset: auto 0 0 0; background: linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,0)); color: white; padding: 2rem; }
.hero-actions { position: absolute; right: 1rem; top: 1rem; display: flex; gap: 0.5rem; align-items: center; }
.ghost-btn { border: 1px solid rgba(255,255,255,.7); background: rgba(255,255,255,.14); color: white; border-radius: 999px; padding: 0.6rem 0.9rem; font-weight: 700; cursor: pointer; }
.delete-request-btn { width: 36px; height: 36px; border-radius: 999px; border: 1px solid rgba(255,255,255,.8); background: rgba(220,38,38,.8); color: white; cursor: pointer; font-size: 1.2rem; font-weight: 800; }
.meta-row { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; }
.pill { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.pill.status-pill { background: #e0f2fe; color: #0369a1; }
.subtitle { margin-top: .5rem; color: #d6e8f7; }
.hero-overlay h1 { margin: 0; font-size: 32px; line-height: 1.15; }
.action-message { color: #d6e8f7; font-size: 13px; }
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; padding: 1.5rem; }
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