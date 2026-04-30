<script setup>
import { ref, computed, onMounted } from 'vue'

const requests = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('PENDING')
const actionMessage = ref('')
const processingId = ref('')

const filteredRequests = computed(() => {
  if (filter.value === 'ALL') return requests.value
  return requests.value.filter((req) => req.status === filter.value)
})

const statusLabel = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Refusée',
}

async function fetchDeletionRequests() {
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:3000/api/deletion-requests', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || 'Chargement impossible')
    requests.value = data.data || []
  } catch (e) {
    error.value = e.message || 'Erreur lors du chargement des demandes.'
  } finally {
    loading.value = false
  }
}

async function reviewRequest(request, decision) {
  processingId.value = request.id
  actionMessage.value = ''
  try {
    const token = localStorage.getItem('token')
    const confirmationText = decision === 'APPROVE'
      ? `Confirmer la suppression de « ${request.entityLabel} » ?`
      : `Refuser la suppression de « ${request.entityLabel} » ?`

    if (!confirm(confirmationText)) return

    const res = await fetch(`http://localhost:3000/api/deletion-requests/${request.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ decision }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Action impossible')

    requests.value = requests.value.map((item) => (item.id === request.id ? data.data : item))
    actionMessage.value = decision === 'APPROVE'
      ? 'Demande approuvée : la ressource a été supprimée.'
      : 'Demande refusée.'
  } catch (e) {
    actionMessage.value = e.message || 'Erreur lors du traitement.'
  } finally {
    processingId.value = ''
  }
}

function getRequesterLabel(request) {
  if (!request.requestedBy) return 'Inconnu'
  return request.requestedBy.firstName || request.requestedBy.login
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR')
}

onMounted(fetchDeletionRequests)
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Demandes de suppression</h1>
      <p>Gérez les demandes de suppression envoyées par les super utilisateurs.</p>
    </header>

    <div class="toolbar">
      <label>
        Filtre
        <select v-model="filter" class="filter-select">
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvées</option>
          <option value="REJECTED">Refusées</option>
          <option value="ALL">Toutes</option>
        </select>
      </label>
      <button class="btn-refresh" @click="fetchDeletionRequests">Rafraîchir</button>
    </div>

    <p v-if="actionMessage" class="action-message">{{ actionMessage }}</p>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="loading" class="loading">Chargement des demandes...</div>

    <div v-else class="requests-grid">
      <article v-for="request in filteredRequests" :key="request.id" class="request-card">
        <div class="request-header">
          <strong>{{ request.entityTypeLabel }} : {{ request.entityLabel }}</strong>
          <span class="status" :class="request.status.toLowerCase()">{{ statusLabel[request.status] }}</span>
        </div>

        <p><b>Demandeur :</b> {{ getRequesterLabel(request) }}</p>
        <p><b>Envoyée le :</b> {{ formatDate(request.requestedAt) }}</p>
        <p><b>ID entité :</b> {{ request.entityId }}</p>

        <div v-if="request.status === 'PENDING'" class="actions">
          <button class="btn-approve" :disabled="processingId === request.id" @click="reviewRequest(request, 'APPROVE')">
            Confirmer
          </button>
          <button class="btn-reject" :disabled="processingId === request.id" @click="reviewRequest(request, 'REJECT')">
            Opposer
          </button>
        </div>
      </article>

      <p v-if="filteredRequests.length === 0" class="empty">Aucune demande pour ce filtre.</p>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
.page-header h1 { margin: 0; color: #0d2d5e; }
.page-header p { color: #666; margin-bottom: 1rem; }
.toolbar { display: flex; gap: 1rem; align-items: end; margin-bottom: 1rem; }
.filter-select { margin-left: .5rem; padding: .45rem; }
.btn-refresh { padding: .5rem .8rem; border: none; background: #1a5c9e; color: #fff; border-radius: 6px; cursor: pointer; }
.requests-grid { display: grid; gap: 1rem; }
.request-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; }
.request-header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: .5rem; }
.status { font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 999px; }
.status.pending { background: #fef3c7; color: #92400e; }
.status.approved { background: #dcfce7; color: #166534; }
.status.rejected { background: #fee2e2; color: #991b1b; }
.actions { display: flex; gap: .75rem; margin-top: .8rem; }
.btn-approve, .btn-reject { border: none; border-radius: 6px; padding: .5rem .8rem; color: white; cursor: pointer; }
.btn-approve { background: #15803d; }
.btn-reject { background: #b91c1c; }
.error-message { background: #fee2e2; color: #991b1b; padding: .8rem; border-radius: 8px; margin: .75rem 0; }
.action-message { background: #eff6ff; color: #1e3a8a; padding: .7rem; border-radius: 8px; }
.loading, .empty { color: #666; }
</style>