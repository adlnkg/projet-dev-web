<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DEFAULT_AVATAR, fixUser } from '../utils/user'
import { useMutation } from '../utils/useData'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const loading = ref(true)
const error = ref(null)
const formError = ref('')
const formSuccess = ref('')

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  age: '',
  sex: '',
  memberType: '',
  role: '',
  avatarUrl: '',
})

const avatarUrl = computed(() => formData.value.avatarUrl || user.value?.avatarUrl || DEFAULT_AVATAR)

async function fetchUser() {
  try {
    const token = localStorage.getItem('token')
    const userId = route.params.id
    const res = await fetch(`http://localhost:3000/api/user/id/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Utilisateur introuvable')
    user.value = fixUser(data)
    formData.value = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      age: data.age || '',
      sex: data.sex || '',
      memberType: data.memberType || '',
      role: data.role || '',
      avatarUrl: data.avatarUrl || '',
    }
  } catch (e) {
    error.value = e.message || 'Erreur lors du chargement'
  } finally {
    loading.value = false
  }
}

async function updateUserAdmin(payload) {
  const token = localStorage.getItem('token')
  const userId = route.params.id
  const res = await fetch(`http://localhost:3000/api/user/id/${userId}/admin`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Erreur lors de la mise à jour')
  return data
}

const { fn: submit, loading: submitting } = useMutation(updateUserAdmin)

onMounted(() => {
  fetchUser()
})

async function onSubmit(e) {
  e.preventDefault()
  formError.value = ''
  formSuccess.value = ''

  if (!formData.value.firstName || !formData.value.lastName) {
    formError.value = 'Le prénom et le nom sont obligatoires.'
    return
  }

  const payload = {
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    age: formData.value.age ? parseInt(formData.value.age, 10) : undefined,
    sex: formData.value.sex || undefined,
    memberType: formData.value.memberType || undefined,
    role: formData.value.role || undefined,
    avatarUrl: formData.value.avatarUrl || undefined,
  }

  const res = await submit(payload)
  if (res) {
    formSuccess.value = 'Utilisateur mis à jour avec succès!'
    setTimeout(() => {
      fetchUser()
      formSuccess.value = ''
    }, 1500)
  }
}

function resetForm() {
  if (user.value) {
    formData.value = {
      firstName: user.value.firstName || '',
      lastName: user.value.lastName || '',
      email: user.value.email || '',
      age: user.value.age || '',
      sex: user.value.sex || '',
      memberType: user.value.memberType || '',
      role: user.value.role || '',
      avatarUrl: user.value.avatarUrl || '',
    }
  }
  formError.value = ''
  formSuccess.value = ''
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <button class="btn-back" @click="router.push('/admin/users')">← Retour</button>
      <h1>Modifier utilisateur</h1>
    </header>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="loading" class="skeleton-card">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>

    <div v-else-if="user" class="edit-card">
      <div class="preview-section">
        <img :src="avatarUrl" :alt="formData.firstName" class="preview-avatar" />
        <div class="preview-info">
          <h2>{{ formData.firstName }} {{ formData.lastName }}</h2>
          <p>@{{ user.login }}</p>
          <p class="email">{{ user.email }}</p>
        </div>
      </div>

      <form class="edit-form" @submit="onSubmit">
        <div v-if="formError" class="error-message">{{ formError }}</div>
        <div v-if="formSuccess" class="success-message">{{ formSuccess }}</div>

        <div class="form-section">
          <h3>Informations personnelles</h3>

          <div class="form-row">
            <div class="form-field">
              <label>Prénom *</label>
              <input v-model="formData.firstName" type="text" required />
            </div>
            <div class="form-field">
              <label>Nom *</label>
              <input v-model="formData.lastName" type="text" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Email</label>
              <input v-model="formData.email" type="email" disabled />
              <small>Non modifiable</small>
            </div>
            <div class="form-field">
              <label>Âge</label>
              <input v-model="formData.age" type="number" min="1" max="120" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Genre</label>
              <select v-model="formData.sex">
                <option value="">— Sélectionner —</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="O">Autre</option>
              </select>
            </div>
            <div class="form-field">
              <label>URL Avatar</label>
              <input v-model="formData.avatarUrl" type="url" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Paramètres d'administration</h3>

          <div class="form-row">
            <div class="form-field">
              <label>Type de membre</label>
              <select v-model="formData.memberType">
                <option value="">— Sélectionner —</option>
                <option value="STUDENT">Étudiant</option>
                <option value="STAFF">Personnel</option>
                <option value="VISITOR">Visiteur</option>
              </select>
            </div>
            <div class="form-field">
              <label>Rôle</label>
              <select v-model="formData.role">
                <option value="">— Sélectionner —</option>
                <option value="USER">User</option>
                <option value="SUPER_USER">Super User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
          <button type="button" class="btn-secondary" @click="resetForm">
            Annuler
          </button>
          <button type="button" class="btn-tertiary" @click="router.push('/admin/users')">
            Retour à la liste
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: white;
  color: #1a5c9e;
  border: 2px solid #1a5c9e;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f0f5ff;
}

.page-header h1 {
  margin: 0;
  color: #0d2d5e;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.success-message {
  background: #dcfce7;
  color: #15803d;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Skeleton */
.skeleton-card {
  padding: 2rem;
}

.skeleton-line {
  height: 20px;
  background: #e5e7eb;
  border-radius: 4px;
  margin: 1rem 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Edit Card */
.edit-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.preview-section {
  background: linear-gradient(135deg, #1a5c9e 0%, #0d2d5e 100%);
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.preview-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  flex-shrink: 0;
}

.preview-info h2 {
  margin: 0 0 0.25rem;
  font-size: 24px;
}

.preview-info p {
  margin: 0;
  font-size: 14px;
  color: #d6e8f7;
}

.preview-info .email {
  font-size: 12px;
  margin-top: 0.5rem;
}

/* Form */
.edit-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1rem;
  color: #0d2d5e;
  font-size: 16px;
  font-weight: 700;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #444;
  font-size: 14px;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-field input:focus,
.form-field select:focus {
  border-color: #1a5c9e;
  box-shadow: 0 0 0 3px rgba(26, 92, 158, 0.1);
}

.form-field input:disabled {
  background: #f9fafb;
  color: #999;
  cursor: not-allowed;
}

.form-field small {
  display: block;
  margin-top: 0.25rem;
  font-size: 12px;
  color: #999;
}

/* Actions */
.form-actions {
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-primary {
  background: #1a5c9e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #0d2d5e;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #1a5c9e;
  border: 2px solid #1a5c9e;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f5ff;
}

.btn-tertiary {
  background: #f0f5ff;
  color: #666;
  border: 1px solid #e5e7eb;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-tertiary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 900px) {
  .page-container {
    padding: 1rem;
  }

  .preview-section {
    flex-direction: column;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .preview-avatar {
    width: 80px;
    height: 80px;
  }

  .preview-info h2 {
    font-size: 18px;
  }

  .edit-form {
    padding: 1.5rem;
  }

  .form-section h3 {
    font-size: 14px;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
