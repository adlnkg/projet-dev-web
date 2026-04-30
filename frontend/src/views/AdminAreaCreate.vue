<script setup>
import EntityForm from '../components/EntityForm.vue'
import { useAdminCreateForm } from '../composables/useAdminCreateForm'

const {
  activeFields,
  cancel,
  formValues,
  loadError,
  loading,
  submitError,
  submitForm,
  submitting,
  success,
} = useAdminCreateForm({
  createFormEndpoint: '/api/areas/create-form',
  submitEndpoint: '/api/areas',
  redirectTo: { path: '/recherche', query: { category: 'area' } },
  successMessage: 'Zone créée.',
  fileFieldLabel: 'Image (fichier)',
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Créer une zone</h1>
      <p>Le formulaire est généré à partir des métadonnées renvoyées par l'API.</p>
    </header>

    <div v-if="loading" class="state-card">Chargement du formulaire...</div>
    <div v-else-if="loadError" class="state-card error">{{ loadError }}</div>

    <EntityForm
      v-else
      v-model="formValues"
      :fields="activeFields"
      title="Nouvelle zone"
      description="Les champs disponibles dépendent du type choisi dans la réponse create-form."
      submit-label="Créer"
      cancel-label="Retour"
      :loading="submitting"
      :error="submitError"
      :success="success"
      @submit="submitForm"
      @cancel="cancel"
    />
  </div>
</template>

<style scoped>
.page-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
.page-header { margin-bottom: 1.25rem; }
.page-header h1 { margin: 0 0 .45rem; color: #0d2d5e; }
.page-header p { margin: 0; color: #5b6472; }
.state-card { background: white; padding: 1rem 1.2rem; border: 1px solid #e5e7eb; border-radius: 12px; color: #334155; }
.state-card.error { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
</style>