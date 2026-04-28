<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button, InputText } from 'primevue'
import { RouterLink } from 'vue-router'
import Alert from '../components/Alert.vue'

const router = useRouter()
const route = useRoute()

const formData = ref({ otp: '', email: '' })
const userEmail = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  const emailFromQuery = route.query.email ? String(route.query.email) : ''
  const emailFromStorage = localStorage.getItem('pendingOtpEmail') || ''
  const email = emailFromQuery || emailFromStorage

  if (!email) {
    router.push('/register')
    return
  }

  userEmail.value = email
  formData.value.email = email
})

function normalizeOtp(value) {
  formData.value.otp = String(value || '').replace(/\D/g, '').slice(0, 6)
}

async function handleVerifyOTP() {
  errorMessage.value = ''
  successMessage.value = ''

  if (formData.value.otp.length !== 6) {
    errorMessage.value = 'Le code OTP doit contenir 6 chiffres.'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.value.email,
        otp: formData.value.otp,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.error || data.message || 'Code OTP invalide.'
      return
    }

    localStorage.removeItem('pendingOtpEmail')
    successMessage.value = 'Compte vérifié avec succès. Redirection...'
    setTimeout(() => router.push('/login'), 900)
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
        <p class="eyebrow">OTP</p>
        <h1>Vérification du compte</h1>
        <p class="subtitle">Un code a été envoyé à <strong>{{ userEmail }}</strong>.</p>
      </header>

      <Alert v-if="errorMessage" :message="errorMessage" type="error" @close="errorMessage = ''" />
      <Alert v-if="successMessage" :message="successMessage" type="success" @close="successMessage = ''" />

      <form @submit.prevent="handleVerifyOTP" class="auth-form">
        <div class="form-group">
          <label for="otp">Code OTP</label>
          <InputText
            id="otp"
            :modelValue="formData.otp"
            @update:modelValue="normalizeOtp"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            required
          />
          <small class="helper">Entrez les 6 chiffres reçus par email.</small>
        </div>

        <Button type="submit" label="Vérifier" :loading="isLoading" class="btn-submit" />
      </form>

      <footer class="auth-links">
        <p><RouterLink to="/login" class="link">Retour à la connexion</RouterLink></p>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: grid; place-items: center; padding: 1rem; background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%); }
.auth-card { width: 100%; max-width: 460px; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 14px 40px rgba(13,45,94,.12); padding: 1.5rem; }
.auth-header { text-align: center; margin-bottom: 1.2rem; }
.eyebrow { margin: 0 0 .5rem; color: #1a5c9e; font-weight: 800; letter-spacing: 1.2px; font-size: 12px; }
.auth-header h1 { margin: 0; color: #0d2d5e; }
.subtitle { margin: .5rem 0 0; color: #6b7280; }
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: .45rem; }
.form-group label { color: #374151; font-size: 13px; font-weight: 700; }
.form-group :deep(input) { width: 100% !important; border: 1.5px solid #e5e7eb !important; border-radius: 8px !important; padding: 10px 12px !important; text-align: center; letter-spacing: 3px; font-size: 20px !important; font-weight: 700; }
.form-group :deep(input):focus { border-color: #1a5c9e !important; box-shadow: 0 0 0 3px rgba(26,92,158,.1) !important; }
.helper { color: #9ca3af; font-size: 12px; }
.btn-submit { width: 100%; margin-top: .35rem; }
.auth-links { margin-top: 1rem; text-align: center; color: #6b7280; font-size: 14px; }
.link { color: #1a5c9e; text-decoration: none; font-weight: 700; cursor: pointer; }
.link:hover { text-decoration: underline; }
@media (min-width: 768px) { .auth-card { padding: 2rem; } }
</style>
