import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { buildFormState } from '../utils/entityForm'

function normalizeFieldValue(field, value) {
  if (value === '' || value === null || value === undefined) return undefined

  if (value instanceof File) return value

  if (field.kind === 'number') {
    const numericValue = Number(value)
    return Number.isNaN(numericValue) ? undefined : numericValue
  }

  if (field.kind === 'datetime') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }

  return String(value)
}

function convertDotNotationToNested(obj = {}) {
  const result = {}
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    if (!key.includes('.')) {
      result[key] = obj[key]
      continue
    }
    const parts = key.split('.')
    let current = result
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part]
    }
    current[parts[parts.length - 1]] = obj[key]
  }
  return result
}

export function useAdminCreateForm({
  createFormEndpoint,
  submitEndpoint,
  redirectTo,
  successMessage,
  fileFieldLabel = 'Image (fichier)',
}) {
  const router = useRouter()
  const definition = ref(null)
  const loading = ref(true)
  const loadError = ref('')
  const submitting = ref(false)
  const submitError = ref('')
  const success = ref('')
  const formValues = ref({})
  const selectedType = ref('')

  const availableTypes = computed(() => definition.value?.create?.typeOptions ?? Object.keys(definition.value?.create?.byType ?? {}))
  const activeType = computed(() => formValues.value.type || selectedType.value || availableTypes.value[0] || '')

  const activeFields = computed(() => {
    const baseFields = definition.value?.create?.byType?.[activeType.value]?.fields ?? []
    const imageField = definition.value?.create?.imageField

    if (!imageField || baseFields.some((field) => field.key === imageField)) {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: imageField,
        label: fileFieldLabel,
        kind: 'file',
        section: 'general',
        readOnly: false,
        editable: true,
        required: false,
        accept: 'image/*',
      },
    ]
  })

  function rebuildFormState(nextType) {
    const baseFields = definition.value?.create?.byType?.[nextType]?.fields ?? []
    // Preserve existing values for matching fields when switching types
    const existingValues = {}
    for (const field of baseFields) {
      if (Object.prototype.hasOwnProperty.call(formValues.value, field.key)) {
        existingValues[field.key] = formValues.value[field.key]
      }
    }
    
    const nextState = buildFormState(baseFields, existingValues)

    if (nextType) {
      nextState.type = nextType
    }

    const imageField = definition.value?.create?.imageField
    if (imageField) {
      nextState[imageField] = Object.prototype.hasOwnProperty.call(formValues.value, imageField)
        ? formValues.value[imageField]
        : null
    }

    formValues.value = nextState
  }

  watch(activeType, (nextType) => {
    if (!definition.value || !nextType) return
    rebuildFormState(nextType)
  }, { immediate: true })

  async function loadCreateForm() {
    loading.value = true
    loadError.value = ''

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000${createFormEndpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Impossible de charger le formulaire')
      }

      definition.value = data.data
      selectedType.value = data.data?.create?.typeOptions?.[0] || Object.keys(data.data?.create?.byType || {})[0] || ''
    } catch (error) {
      loadError.value = error.message || 'Impossible de charger le formulaire.'
    } finally {
      loading.value = false
    }
  }

  async function submitForm() {
    if (!definition.value) return null

    submitting.value = true
    submitError.value = ''
    success.value = ''

    try {
      const create = definition.value.create
      const requiredFieldKeys = create.byType?.[activeType.value]?.requiredFieldKeys ?? []
      
      // Validate required fields before submitting
      const missingFields = []
      for (const key of requiredFieldKeys) {
        const value = formValues.value[key]
        if (value === undefined || value === null || value === '') {
          const field = activeFields.value.find(f => f.key === key)
          const label = field?.label || key
          missingFields.push(`${label} (${key})`)
        }
      }
      
      if (missingFields.length > 0) {
        submitError.value = `Champ(s) manquant(s): ${missingFields.join(', ')}`
        submitting.value = false
        return null
      }

      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      let body

      if (create.contentType === 'application/json') {
        const flatPayload = {}

        for (const field of activeFields.value) {
          if (!field.editable || field.readOnly) continue

          const normalizedValue = normalizeFieldValue(field, formValues.value[field.key])
          if (normalizedValue === undefined) continue
          if (normalizedValue instanceof File) continue
          flatPayload[field.key] = normalizedValue
        }

        // Convert dot notation keys (e.g., "thermostat.temperature") to nested structure
        const payload = convertDotNotationToNested(flatPayload)

        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(payload)
      } else {
        const formData = new FormData()

        for (const field of activeFields.value) {
          if (!field.editable || field.readOnly) continue

          const normalizedValue = normalizeFieldValue(field, formValues.value[field.key])
          if (normalizedValue === undefined) continue

          if (normalizedValue instanceof File) {
            formData.append(field.key, normalizedValue)
            continue
          }

          // Convert dot notation to bracket notation for nested fields in multipart/form-data
          // e.g., "thermostat.temperature" → "thermostat[temperature]"
          const keyForFormData = field.key.includes('.')
            ? field.key.split('.').reduce((acc, part, idx) => idx === 0 ? part : `${acc}[${part}]`, '')
            : field.key

          formData.append(keyForFormData, String(normalizedValue))
        }

        body = formData
      }

      const res = await fetch(`http://localhost:3000${submitEndpoint}`, {
        method: create.method || 'POST',
        headers,
        body,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Création impossible')
      }

      success.value = data.message || successMessage
      setTimeout(() => router.push(redirectTo), 800)
      return data
    } catch (error) {
      submitError.value = error.message || 'Erreur lors de la création.'
      return null
    } finally {
      submitting.value = false
    }
  }

  function cancel() {
    router.push(redirectTo)
  }

  onMounted(loadCreateForm)

  return {
    activeFields,
    activeType,
    cancel,
    definition,
    formValues,
    loadError,
    loading,
    submitError,
    submitForm,
    submitting,
    success,
  }
}