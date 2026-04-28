<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button, InputText, Password } from 'primevue'
import { RouterLink } from 'vue-router'
import Alert from '../components/Alert.vue'

const router = useRouter()
const route = useRoute()

const formData = ref({ login: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: formData.value.login,
        password: formData.value.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.error || 'Identifiants invalides.'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    successMessage.value = 'Connexion réussie !'

    const redirect = route.query.redirect ? String(route.query.redirect) : '/'
    setTimeout(() => router.push(redirect), 700)
  } catch {
    errorMessage.value = 'Erreur serveur. Merci de réessayer.'
    setTimeout(() => router.push('/500'), 1000)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <p class="eyebrow">CYTECH</p>
        <h1>Se connecter</h1>
        <p class="subtitle">Accédez à votre espace personnel.</p>
      </header>

      <Alert v-if="errorMessage" :message="errorMessage" type="error" @close="errorMessage = ''" />
      <Alert v-if="successMessage" :message="successMessage" type="success" @close="successMessage = ''" />

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login">Login</label>
          <InputText id="login" v-model="formData.login" placeholder="Votre identifiant" required />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <Password id="password" v-model="formData.password" placeholder="Votre mot de passe" :feedback="false" toggleMask required />
        </div>

        <Button type="submit" label="Se connecter" :loading="isLoading" class="btn-submit" />
      </form>

      <footer class="auth-links">
        <p>Pas encore inscrit ? <RouterLink to="/register" class="link">Créer un compte</RouterLink></p>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: grid; place-items: center; padding: 1rem; background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%); }
.auth-card { width: 100%; max-width: 460px; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 14px 40px rgba(13, 45, 94, 0.12); padding: 1.5rem; }
.auth-header { text-align: center; margin-bottom: 1.2rem; }
.eyebrow { margin: 0 0 .5rem; color: #1a5c9e; font-weight: 800; letter-spacing: 1.2px; font-size: 12px; }
.auth-header h1 { margin: 0; color: #0d2d5e; }
.subtitle { margin: .5rem 0 0; color: #6b7280; }
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: .45rem; }
.form-group label { color: #374151; font-size: 13px; font-weight: 700; }
.form-group :deep(input) { width: 100% !important; border: 1.5px solid #e5e7eb !important; border-radius: 8px !important; padding: 10px 12px !important; }
.form-group :deep(input):focus { border-color: #1a5c9e !important; box-shadow: 0 0 0 3px rgba(26,92,158,.1) !important; }
.btn-submit { width: 100%; margin-top: .35rem; }
.auth-links { margin-top: 1rem; text-align: center; color: #6b7280; font-size: 14px; }
.link { color: #1a5c9e; text-decoration: none; font-weight: 700; cursor: pointer; }
.link:hover { text-decoration: underline; }
@media (min-width: 768px) { .auth-card { padding: 2rem; } }
</style>
