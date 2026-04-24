<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Créer un compte</h1>
      
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

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <InputText 
              id="firstName" 
              v-model="formData.firstName" 
              placeholder="Prénom"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nom</label>
            <InputText 
              id="lastName" 
              v-model="formData.lastName" 
              placeholder="Nom"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="login">Login</label>
          <InputText 
            id="login" 
            v-model="formData.login" 
            placeholder="Entrez votre login"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <InputText 
            id="email" 
            v-model="formData.email" 
            placeholder="Votre email"
            type="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <Password 
            id="password" 
            v-model="formData.password" 
            placeholder="Entrez un mot de passe"
            :feedback="false"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="age">Âge</label>
            <InputNumber 
              id="age" 
              v-model="formData.age" 
              placeholder="Votre âge"
            />
          </div>

          <div class="form-group">
            <label for="sex">Sexe</label>
            <Dropdown 
              id="sex" 
              v-model="formData.sex" 
              :options="sexOptions" 
              placeholder="Sélectionner"
              optionLabel="label"
              optionValue="value"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="memberType">Type de membre</label>
          <Dropdown 
            id="memberType" 
            v-model="formData.memberType" 
            :options="memberTypeOptions" 
            placeholder="Sélectionner"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        <Button 
          type="submit" 
          label="S'inscrire" 
          :loading="isLoading"
          class="btn-submit"
        />
      </form>

      <div class="auth-links">
        <p>
          Vous avez déjà un compte ? 
          <RouterLink to="/login" class="link">Se connecter</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, InputText, Password, InputNumber, Dropdown } from 'primevue'
import { RouterLink } from 'vue-router'
import Alert from '../components/Alert.vue'

const router = useRouter()

const formData = ref({
  firstName: '',
  lastName: '',
  login: '',
  email: '',
  password: '',
  age: null,
  sex: null,
  memberType: 'STUDENT',
  avatarUrl: ''
})

const sexOptions = [
  { label: 'Homme', value: 'M' },
  { label: 'Femme', value: 'F' }
]

const memberTypeOptions = [
  { label: 'Étudiant', value: 'STUDENT' }
]

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        login: formData.value.login,
        email: formData.value.email,
        password: formData.value.password,
        age: formData.value.age,
        sex: formData.value.sex,
        memberType: formData.value.memberType,
        avatarUrl: formData.value.avatarUrl,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.error || data.message || 'Erreur lors de l\'inscription'
      return
    }

    successMessage.value = 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'
    
    setTimeout(() => {
      router.push(`/verify-otp?email=${formData.value.email}`)
    }, 2000)
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
  max-height: 90vh;
  overflow-y: auto;
}

.auth-card h1 {
  text-align: center;
  margin-bottom: 24px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.form-group :deep(input),
.form-group :deep(.p-dropdown),
.form-group :deep(.p-inputnumber) {
  width: 100% !important;
  padding: 12px 14px !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px !important;
  font-size: 16px !important;
  font-family: 'Inter', sans-serif !important;
}

.form-group :deep(input):focus,
.form-group :deep(.p-dropdown):focus,
.form-group :deep(.p-inputnumber):focus {
  outline: none !important;
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
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
    max-width: 480px;
  }

  .auth-card h1 {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .auth-form {
    gap: 20px;
  }

  .form-row {
    gap: 15px;
  }

  .form-group {
    gap: 8px;
  }
}
</style>
