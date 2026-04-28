<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '../utils/useData'

const router = useRouter()
const title = ref('')
const content = ref('')
const imageFile = ref(null)
const message = ref('')

async function createActuality(formData) {
  const token = localStorage.getItem('token')
  const res = await fetch('http://localhost:3000/api/actualities', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Erreur création actualité')
  return data
}

const { fn: submit, loading, error } = useMutation(createActuality)

async function onSubmit(e) {
  e.preventDefault()
  const fd = new FormData()
  fd.append('title', title.value)
  fd.append('content', content.value)
  if (imageFile.value) fd.append('image', imageFile.value)
  const res = await submit(fd)
  if (res) {
    message.value = 'Actualité créée.'
    setTimeout(() => router.push('/actualites'), 800)
  }
}

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  if (f) imageFile.value = f
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Créer une actualité</h1>
    </header>

    <form class="form-card" @submit="onSubmit">
      <div class="form-field">
        <label>Titre</label>
        <input v-model="title" required />
      </div>

      <div class="form-field">
        <label>Contenu</label>
        <textarea v-model="content" rows="6" required></textarea>
      </div>

      <div class="form-field">
        <label>Image (optionnelle)</label>
        <input type="file" accept="image/*" @change="onFileChange" />
      </div>

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
.form-card { background: white; padding: 1.2rem; border-radius: 12px; border: 1px solid #e5e7eb; max-width: 800px; }
.form-field { margin-bottom: 1rem; }
.form-field label { display:block; margin-bottom:6px; font-weight:700; color:#444; }
.form-field input[type="file"] { padding:6px 0; }
.form-field input, .form-field textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius:8px; }
.form-actions { display:flex; align-items:center; gap:12px; }
.btn-primary { background: #1a5c9e; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
.form-msg { color: #15803d; font-weight:600; }
.form-error { color: #c41d1d; }
</style>
