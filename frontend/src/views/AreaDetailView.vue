<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EntityForm from '../components/EntityForm.vue'
import { buildFormState, buildUpdatePayload, getFieldDisplayValue } from '../utils/entityForm'

const route = useRoute()
const router = useRouter()
const area = ref(null)
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editSuccess = ref('')
const formValues = ref({})

const canEdit = computed(() => Boolean(area.value?.form?.editableFieldKeys?.length))
const imageUrl = computed(() => {
  const value = isEditing.value ? formValues.value.imageUrl : area.value?.imageUrl
  return value ? `http://localhost:3000/${value}` : 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80'
})
const iotDevices = computed(() => area.value?.iotDevices ?? [])

function syncFormState(resource) {
  formValues.value = buildFormState(resource?.form?.fields ?? [])
}

function formatDate(value) {
  if (!value) return 'Date inconnue'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function goToDevice(deviceId) {
  if (!deviceId) return
  router.push({ name: 'device-detail', params: { id: deviceId } })
}

function goToArea(areaId) {
  if (!areaId) return
  router.push({ name: 'area-detail', params: { id: areaId } })
}

function startEditing() {
  if (!canEdit.value || !area.value) return
  editError.value = ''
  editSuccess.value = ''
  syncFormState(area.value)
  isEditing.value = true
}

function cancelEditing() {
  if (area.value) {
    syncFormState(area.value)
  }
  editError.value = ''
  editSuccess.value = ''
  isEditing.value = false
}

async function loadArea() {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`http://localhost:3000/api/areas/${route.params.id}`, { headers })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Zone introuvable')
    }
    area.value = data.data
    syncFormState(data.data)
  } catch (e) {
    error.value = e.message || 'Impossible de charger la zone.'
  } finally {
    loading.value = false
  }
}

async function saveArea() {
  if (!area.value) return
  editLoading.value = true
  editError.value = ''
  editSuccess.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Connexion requise pour modifier cette zone.')

    const payload = buildUpdatePayload(area.value.form.fields, formValues.value)
    const res = await fetch(`http://localhost:3000/api/areas/${route.params.id}`, {
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

    area.value = data.data
    syncFormState(data.data)
    isEditing.value = false
    editSuccess.value = data.message || 'Zone mise à jour.'
  } catch (e) {
    editError.value = e.message || 'Impossible de mettre à jour la zone.'
  } finally {
    editLoading.value = false
  }
}

onMounted(loadArea)
watch(() => route.params.id, () => {
  isEditing.value = false
  editError.value = ''
  editSuccess.value = ''
  loadArea()
})
</script>

<template>
  <main class="page-container">
    <button class="back-btn" @click="router.push('/recherche?category=area')">← Retour aux zones</button>

    <div v-if="loading" class="state-card">Chargement de la zone...</div>
    <div v-else-if="error" class="state-card error">{{ error }}</div>

    <article v-else-if="area" class="detail-card">
      <div class="hero">
        <img :src="imageUrl" :alt="area.name" class="hero-img" />
        <div class="hero-overlay">
          <div class="hero-actions" v-if="canEdit">
            <button v-if="!isEditing" class="ghost-btn" @click="startEditing">Modifier</button>
            <button v-else class="ghost-btn" @click="cancelEditing">Voir</button>
          </div>
          <div class="meta-row">
            <span class="pill">{{ area.type }}</span>
            <RouterLink
              v-if="area.parentArea"
              class="pill secondary pill-link"
              :to="{ name: 'area-detail', params: { id: area.parentArea.id } }"
            >
              Parent : {{ area.parentArea.name }}
            </RouterLink>
          </div>
          <h1>{{ area.name }}</h1>
          <p v-if="area.owner?.login || area.ownerName" class="subtitle">Créé par {{ area.owner?.firstName || area.ownerName || area.owner?.login }}</p>
        </div>
      </div>

      <div v-if="!isEditing" class="content-grid">
        <section class="content-panel">
          <h2>Description</h2>
          <p class="content-text">{{ area.description || 'Aucune description disponible.' }}</p>

          <div class="summary-grid">
            <div class="summary-card">
              <span>Type</span>
              <strong>{{ area.type }}</strong>
            </div>
            <RouterLink
              v-if="area.parentArea"
              class="summary-card summary-card-link"
              :to="{ name: 'area-detail', params: { id: area.parentArea.id } }"
            >
              <span>Zone parente</span>
              <strong>{{ area.parentArea.name }}</strong>
            </RouterLink>
            <div v-else class="summary-card">
              <span>Zone parente</span>
              <strong>Aucune</strong>
            </div>
            <div class="summary-card" v-if="area.form?.fields?.some(f => f.section === 'specific')">
              <span>Spécifique</span>
              <strong>
                {{ getFieldDisplayValue(area.form.fields.find(f => f.section === 'specific')) }}
              </strong>
            </div>
            <div class="summary-card" v-if="iotDevices.length">
              <span>Appareils</span>
              <strong>{{ iotDevices.length }} liés</strong>
            </div>
          </div>
        </section>

        <aside class="side-panel">
          <h3>Informations</h3>
          <div class="info-item">
            <span>Identifiant</span>
            <strong>{{ area.id }}</strong>
          </div>
          <div class="info-item" v-if="area.owner?.login || area.ownerName">
            <span>Auteur</span>
            <strong>{{ area.owner?.firstName || area.ownerName || area.owner?.login }}</strong>
          </div>
          <div class="info-item" v-if="area.form?.fields?.some(f => f.section === 'specific')">
            <span>Détails spécifiques</span>
            <div>
              <div v-for="field in area.form.fields.filter(f => f.section === 'specific')" :key="field.key" style="margin-bottom:0.5rem;">
                <small style="color:#6b7280">{{ field.label }}</small>
                <div class="field-value" style="margin-top:0.25rem">{{ getFieldDisplayValue(field) }}</div>
              </div>
            </div>
          </div>
          <div class="info-item" v-if="area.parentArea">
            <span>Zone parente</span>
            <RouterLink class="link-like" :to="{ name: 'area-detail', params: { id: area.parentArea.id } }">
              {{ area.parentArea.name }}
            </RouterLink>
          </div>
        </aside>
      </div>

      <div v-else class="content-grid edit-grid">
        <section class="content-panel edit-panel">
          <EntityForm
            v-model="formValues"
            :fields="area.form.fields"
            title="Modifier la zone"
            description="Le formulaire est généré à partir des métadonnées renvoyées par l'API."
            submit-label="Enregistrer"
            :loading="editLoading"
            :error="editError"
            :success="editSuccess"
            @submit="saveArea"
            @cancel="cancelEditing"
          />
        </section>

        <aside class="side-panel">
          <h3>Aperçu</h3>
          <div class="info-item">
            <span>Type</span>
            <strong>{{ area.type }}</strong>
          </div>
          <div class="info-item">
            <span>Parent</span>
            <strong>{{ area.parentArea?.name || 'Aucune' }}</strong>
          </div>
          <div class="info-item">
            <span>Image</span>
            <strong>{{ getFieldDisplayValue({ value: formValues.imageUrl || area.imageUrl }) }}</strong>
          </div>
        </aside>
      </div>

      <section v-if="iotDevices.length" class="devices-section">
        <div class="section-header">
          <h2>Objets connectés liés</h2>
          <span>{{ iotDevices.length }} appareil{{ iotDevices.length > 1 ? 's' : '' }}</span>
        </div>

        <div class="devices-grid">
          <RouterLink
            v-for="device in iotDevices"
            :key="device.id"
            class="device-card device-card-link"
            :to="{ name: 'device-detail', params: { id: device.id } }"
          >
            <div class="device-card-header">
              <h3>{{ device.name }}</h3>
              <span>{{ device.uniqueName }}</span>
            </div>
            <p>{{ device.description || 'Aucune description.' }}</p>
            <div class="device-card-grid">
              <div>
                <small>Consommation</small>
                <strong>{{ device.consumption?.electricityConsumptionKwh ?? '—' }} kWh</strong>
              </div>
              <div>
                <small>Maintenance</small>
                <strong>{{ device.maintenance?.maintenanceRequired ? 'Requise' : 'À jour' }}</strong>
              </div>
            </div>
          </RouterLink>
        </div>
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
.hero-overlay { position: absolute; inset: auto 0 0 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0)); color: white; padding: 2rem; }
.hero-actions { position: absolute; right: 1rem; top: 1rem; }
.ghost-btn { border: 1px solid rgba(255, 255, 255, 0.7); background: rgba(255, 255, 255, 0.14); color: white; border-radius: 999px; padding: 0.6rem 0.9rem; font-weight: 700; cursor: pointer; }
.meta-row { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; }
.pill { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.pill.secondary { background: #e0f2fe; color: #0369a1; }
.pill-link { text-decoration: none; display: inline-flex; align-items: center; }
.subtitle { margin-top: .5rem; color: #d6e8f7; }
.hero-overlay h1 { margin: 0; font-size: 32px; line-height: 1.15; }
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; padding: 1.5rem; }
.content-panel,
.side-panel { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; }
.content-panel h2,
.side-panel h3 { margin: 0 0 1rem; color: #0d2d5e; }
.content-text { white-space: pre-line; line-height: 1.7; color: #444; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-top: 1.25rem; }
.summary-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 0.95rem; background: #f8fbff; display: grid; gap: 0.35rem; }
.summary-card-link { color: inherit; text-decoration: none; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.summary-card-link:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(26, 92, 158, 0.1); }
.summary-card span { font-size: 12px; color: #6b7280; }
.summary-card strong { color: #0d2d5e; }
.info-item { display: grid; gap: 0.25rem; padding: 0.85rem 0; border-top: 1px solid #f0f0f0; }
.info-item:first-of-type { border-top: none; padding-top: 0; }
.info-item span { font-size: 12px; color: #777; }
.info-item strong { color: #0d2d5e; }
.link-like { cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.info-item pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 12px; color: #555; background: #f8fafc; padding: 0.75rem; border-radius: 10px; overflow: auto; }
.devices-section { padding: 0 1.5rem 1.5rem; }
.section-header { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.section-header h2 { margin: 0; color: #0d2d5e; }
.section-header span { color: #6b7280; font-size: 13px; font-weight: 600; }
.devices-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.device-card { border: 1px solid #e5e7eb; border-radius: 14px; background: #fafcff; padding: 1rem; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.device-card-link { color: inherit; text-decoration: none; }
.device-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26, 92, 158, 0.1); }
.device-card-header { display: grid; gap: 0.2rem; margin-bottom: 0.75rem; }
.device-card-header h3 { margin: 0; color: #0d2d5e; }
.device-card-header span { font-size: 12px; color: #6b7280; }
.device-card p { margin: 0 0 0.9rem; color: #475569; }
.device-card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.device-card-grid small { display: block; color: #6b7280; font-size: 11px; margin-bottom: 0.2rem; }
.device-card-grid strong { color: #0d2d5e; }
@media (max-width: 900px) {
  .page-container { padding: 1rem; }
  .content-grid { grid-template-columns: 1fr; }
  .hero-overlay h1 { font-size: 26px; }
  .devices-section { padding: 0 1rem 1rem; }
}
@media (max-width: 480px) {
  .hero-overlay { padding: 1rem; }
  .hero-overlay h1 { font-size: 22px; }
  .content-grid { padding: 1rem; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .device-card-grid { grid-template-columns: 1fr; }
}
</style>
