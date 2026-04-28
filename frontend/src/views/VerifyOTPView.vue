<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Vérification du compte</h1>
      <p class="subtitle">Un code de vérification a été envoyé à <strong>{{ userEmail }}</strong></p>
      
      <Alert 
        v-if="errorMessage" 
        :message="errorMessage" 
        type="error"
        @close="errorMessage = ''"
      />
      
      <Alert 
        v-if="successMessage" 
        :message="successMessage" 
        type="success"
        @close="successMessage = ''"
      />

      <form @submit.prevent="handleVerifyOTP" class="auth-form">
        <div class="form-group">
          <label for="otp">Code de vérification</label>
          <InputText
            id="otp"
            :modelValue="formData.otp"
            @update:modelValue="normalizeOtp"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            required
          />
          <small class="helper-text">Entrez le code à 6 chiffres</small>
        </div>

        <Button 
          type="submit" 
          label="Vérifier" 
          :loading="isLoading"
          class="btn-submit"
        />
      </form>

      <div class="auth-links">
        <p>
          <RouterLink to="/login" class="link">Retour à la connexion</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button, InputText } from 'primevue'
import { RouterLink } from 'vue-router'
import Alert from '../components/Alert.vue'

const router = useRouter()
const route = useRoute()

const formData = ref({
  otp: '',
  email: ''
})

const userEmail = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  const emailParam = route.query.email
  if (emailParam) {
    userEmail.value = emailParam
    formData.value.email = emailParam
  } else {
    router.push('/register')
  }
})

const handleVerifyOTP = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.value.email,
        otp: formData.value.otp,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.error || data.message || 'Erreur lors de la vérification'
      return
    }

    successMessage.value = 'Compte vérifié avec succès ! Redirection...'
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMessage.value = 'Erreur serveur: ' + error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 100%;
  max-width: 100%;
}

.auth-card h1 {
  text-align: center;
  margin-bottom: 12px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 24px;
  line-height: 1.5;
  font-weight: 400;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group :deep(input) {
  width: 100% !important;
  padding: 12px 14px !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px !important;
  font-size: 16px !important;
  font-family: 'Inter', sans-serif !important;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 600;
}

.form-group :deep(input):focus {
  outline: none !important;
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.helper-text {
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
}

.message {
  margin: 0 !important;
}

.btn-submit {
  width: 100%;
  padding: 12px 16px !important;
  margin-top: 8px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.auth-links {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #6b7280;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.link:hover {
  text-decoration: underline;
  color: #764ba2;
}

/* Tablette et desktop */
@media (min-width: 640px) {
  .auth-container {
    padding: 20px;
  }

  .auth-card {
    padding: 40px;
    max-width: 420px;
  }

  .auth-card h1 {
    font-size: 28px;
    margin-bottom: 15px;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 30px;
  }

  .auth-form {
    gap: 20px;
  }

  .form-group {
    gap: 8px;
  }
}
</style>
