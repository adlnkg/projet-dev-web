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
const isEditing = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editSuccess = ref('')
const formValues = ref({})

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
    syncFormState(data.data)
  } catch (e) {
    error.value = e.message || 'Impossible de charger cet objet connecté.'
  } finally {
    loading.value = false
  }
}

async function saveDevice() {
  if (!device.value) return
  editLoading.value = true
  editError.value = ''
  editSuccess.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise pour modifier cet appareil.')

    const payload = buildUpdatePayload(device.value.form.fields, formValues.value)
    const res = await fetch(`http://localhost:3000/api/devices/${route.params.id}`, {
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

    device.value = data.data
    syncFormState(data.data)
    isEditing.value = false
    editSuccess.value = data.message || 'Appareil mis à jour.'
  } catch (e) {
    editError.value = e.message || 'Impossible de mettre à jour cet appareil.'
  } finally {
    editLoading.value = false
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
.content-panel,
.side-panel { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; }
.content-panel h2,
.side-panel h3 { margin: 0 0 1rem; color: #0d2d5e; }
.content-text { white-space: pre-line; line-height: 1.7; color: #444; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-top: 1.25rem; }
.stat-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 0.95rem; background: #f8fbff; display: grid; gap: 0.35rem; }
.stat-card span { font-size: 12px; color: #6b7280; }
.stat-card strong { color: #0d2d5e; }
.info-item { display: grid; gap: 0.25rem; padding: 0.85rem 0; border-top: 1px solid #f0f0f0; }
.info-item:first-of-type { border-top: none; padding-top: 0; }
.info-item span { font-size: 12px; color: #777; }
.info-item strong { color: #0d2d5e; }
.link-like { cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.info-item pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 12px; color: #555; background: #f8fafc; padding: 0.75rem; border-radius: 10px; overflow: auto; }
.history-section { padding: 0 1.5rem 1.5rem; }
.section-header { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.section-header h2 { margin: 0; color: #0d2d5e; }
.section-header span { color: #6b7280; font-size: 13px; font-weight: 600; }
.history-list { display: grid; gap: 0.85rem; }
.history-item { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1rem; background: #fafcff; display: grid; gap: 0.6rem; }
.history-item p { margin: 0.2rem 0 0; color: #64748b; }
.history-values { display: flex; gap: 0.5rem; flex-wrap: wrap; color: #0d2d5e; font-weight: 600; }
.history-empty { border: 1px dashed #d1d5db; border-radius: 14px; padding: 1.25rem; text-align: center; color: #777; background: #fafafa; }
@media (max-width: 900px) {
  .page-container { padding: 1rem; }
  .content-grid { grid-template-columns: 1fr; }
  .hero-overlay h1 { font-size: 26px; }
  .history-section { padding: 0 1rem 1rem; }
}
@media (max-width: 480px) {
  .hero-overlay { padding: 1rem; }
  .hero-overlay h1 { font-size: 22px; }
  .content-grid { padding: 1rem; }
  .section-header { flex-direction: column; align-items: flex-start; }
}
</style>