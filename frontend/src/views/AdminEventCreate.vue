<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '../utils/useData'

const router = useRouter()
const title = ref('')
const description = ref('')
const organizer = ref('')
const startTime = ref('')
const endTime = ref('')
const maxParticipants = ref(10)
const areaId = ref('')
const price = ref(0)
const imageFile = ref(null)
const message = ref('')
const formError = ref('')

async function createEvent(payload) {
  const token = localStorage.getItem('token')
  const res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: payload,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Erreur création événement')
  return data
}

const { fn: submit, loading, error } = useMutation(createEvent)

async function onSubmit(e) {
  e.preventDefault()
  formError.value = ''
  // validate areaId if provided: must be an integer
  if (areaId.value && String(areaId.value).trim() !== '') {
    const v = String(areaId.value).trim()
    if (!/^\d+$/.test(v)) {
      formError.value = 'Zone doit être un nombre valide.'
      return
    }
  }

  const fd = new FormData()
  fd.append('title', title.value)
  fd.append('description', description.value)
  fd.append('organizer', organizer.value)
  if (startTime.value) fd.append('startTime', new Date(startTime.value).toISOString())
  if (endTime.value) fd.append('endTime', new Date(endTime.value).toISOString())
  fd.append('maxParticipants', String(maxParticipants.value))
  if (areaId.value) fd.append('areaId', String(parseInt(areaId.value, 10)))
  fd.append('price', String(price.value))
  if (imageFile.value) fd.append('image', imageFile.value)

  const res = await submit(fd)
  if (res) {
    message.value = 'Événement créé.'
    formError.value = ''
    setTimeout(() => router.push('/evenements'), 800)
  }
}

function onFileChange(e) { const f = e.target.files && e.target.files[0]; if (f) imageFile.value = f }
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Créer un événement</h1>
    </header>

    <form class="form-card" @submit="onSubmit">
      <div class="form-field"><label>Titre</label><input v-model="title" required /></div>
      <div class="form-field"><label>Description</label><textarea v-model="description" rows="5" required></textarea></div>
      <div class="form-field"><label>Organisateur</label><input v-model="organizer" /></div>
      <div class="form-row">
        <div class="form-field"><label>Début</label><input type="datetime-local" v-model="startTime" /></div>
        <div class="form-field"><label>Fin</label><input type="datetime-local" v-model="endTime" /></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>Max participants</label><input type="number" v-model.number="maxParticipants" min="1" /></div>
        <div class="form-field"><label>Prix</label><input type="number" v-model.number="price" min="0" /></div>
      </div>
      <div class="form-field"><label>Area ID (optionnel)</label><input v-model="areaId" /></div>
      <div class="form-field"><label>Image (optionnelle)</label><input type="file" accept="image/*" @change="onFileChange" /></div>

      <div class="form-actions">
        <button class="btn-primary" :disabled="loading">{{ loading ? 'Envoi...' : 'Créer' }}</button>
        <span class="form-msg">{{ message }}</span>
        <span v-if="error" class="form-error">{{ error?.message }}</span>
      </div>
    </form>
  </div>
</template>

<style scoped>
.page-container { padding: 2rem; }
.page-header h1 { margin: 0 0 1rem; color: #0d2d5e; }
.form-card { background: white; padding: 1.2rem; border-radius: 12px; border: 1px solid #e5e7eb; max-width: 900px; }
.form-row { display:flex; gap: 1rem; }
.form-field { margin-bottom: 1rem; flex:1; }
.form-field label { display:block; margin-bottom:6px; font-weight:700; color:#444; }
.form-field input, .form-field textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius:8px; }
.form-actions { display:flex; align-items:center; gap:12px; }
.btn-primary { background: #1a5c9e; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
.form-msg { color: #15803d; font-weight:600; }
.form-error { color: #c41d1d; }
@media (max-width: 900px) { .form-row { flex-direction: column; } }
</style>
