<script setup>
import { computed } from 'vue'
import { groupFieldsBySection } from '../utils/entityForm'

const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  submitLabel: {
    type: String,
    default: 'Enregistrer',
  },
  cancelLabel: {
    type: String,
    default: 'Annuler',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  success: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const sections = computed(() => {
  const groupedFields = groupFieldsBySection(props.fields)
  return [
    {
      key: 'general',
      title: 'Informations générales',
      fields: groupedFields.general || [],
    },
    {
      key: 'specific',
      title: 'Informations spécifiques',
      fields: groupedFields.specific || [],
    },
  ].filter((section) => section.fields.length > 0)
})

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field.key]: value,
  })
}

function fieldValue(field) {
  const currentValue = props.modelValue[field.key]
  return currentValue === null || currentValue === undefined ? '' : currentValue
}
</script>

<template>
  <form class="entity-form" @submit.prevent="emit('submit')">
    <header v-if="title || description" class="entity-form-header">
      <div>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
    </header>

    <section v-for="section in sections" :key="section.key" class="entity-form-section">
      <h3>{{ section.title }}</h3>

      <div class="entity-form-grid">
        <div v-for="field in section.fields" :key="field.key" class="entity-field" :class="{ 'is-readonly': field.readOnly || field.editable === false }">
          <label :for="field.key">
            {{ field.label }}
            <span v-if="field.required" class="required-indicator">*</span>
          </label>

          <small v-if="field.readOnly || field.editable === false" class="field-hint">Non modifiable</small>

          <input
            v-if="field.kind === 'text' || field.kind === 'number' || field.kind === 'datetime'"
            :id="field.key"
            :type="field.kind === 'datetime' ? 'datetime-local' : field.kind"
            :min="field.min ?? undefined"
            :max="field.max ?? undefined"
            :step="field.step ?? undefined"
            :disabled="field.readOnly || field.editable === false"
            :value="fieldValue(field)"
            @input="updateField(field, $event.target.value)"
          />

          <textarea
            v-else-if="field.kind === 'textarea'"
            :id="field.key"
            :rows="field.rows ?? 5"
            :minlength="field.minLength ?? undefined"
            :maxlength="field.maxLength ?? undefined"
            :disabled="field.readOnly || field.editable === false"
            :value="fieldValue(field)"
            @input="updateField(field, $event.target.value)"
          />

          <select
            v-else-if="field.kind === 'select'"
            :id="field.key"
            :disabled="field.readOnly || field.editable === false"
            :value="fieldValue(field)"
            @change="updateField(field, $event.target.value)"
          >
            <option v-if="!field.required" value="">— Sélectionner —</option>
            <option v-for="option in field.options || []" :key="typeof option === 'object' ? option.value : option" :value="typeof option === 'object' ? option.value : option">
              {{ typeof option === 'object' ? option.label : option }}
            </option>
          </select>

          <div v-else class="field-value">{{ fieldValue(field) }}</div>

          <small v-if="field.minLength !== undefined || field.maxLength !== undefined || field.min !== undefined || field.max !== undefined" class="field-hint">
            <span v-if="field.minLength !== undefined">Min. {{ field.minLength }}</span>
            <span v-if="field.maxLength !== undefined">Max. {{ field.maxLength }}</span>
            <span v-if="field.min !== undefined">Min. {{ field.min }}</span>
            <span v-if="field.max !== undefined">Max. {{ field.max }}</span>
          </small>
        </div>
      </div>
    </section>

    <div v-if="error" class="form-alert error">{{ error }}</div>
    <div v-if="success" class="form-alert success">{{ success }}</div>

    <div class="entity-form-actions">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Enregistrement...' : submitLabel }}
      </button>
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        {{ cancelLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.entity-form {
  display: grid;
  gap: 1.25rem;
}

.entity-form-header h2 {
  margin: 0 0 0.35rem;
  color: #0d2d5e;
  font-size: 22px;
}

.entity-form-header p {
  margin: 0;
  color: #5b6472;
  line-height: 1.5;
}

.entity-form-section {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.1rem;
  background: #fbfcfe;
}

.entity-form-section h3 {
  margin: 0 0 1rem;
  color: #0d2d5e;
  font-size: 16px;
}

.entity-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.entity-field {
  display: grid;
  gap: 0.45rem;
}

.entity-field label {
  font-size: 14px;
  font-weight: 700;
  color: #303843;
}

.required-indicator {
  color: #dc2626;
}

.entity-field input,
.entity-field textarea,
.entity-field select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d8dee8;
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  font: inherit;
  background: white;
  color: #172033;
}

.entity-field textarea {
  resize: vertical;
  min-height: 120px;
}

.entity-field input:focus,
.entity-field textarea:focus,
.entity-field select:focus {
  outline: none;
  border-color: #1a5c9e;
  box-shadow: 0 0 0 3px rgba(26, 92, 158, 0.12);
}

.entity-field.is-readonly input,
.entity-field.is-readonly textarea,
.entity-field.is-readonly select {
  background: #f8fafc;
  color: #64748b;
}

.field-value {
  padding: 0.8rem 0.9rem;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #d8dee8;
  color: #334155;
  min-height: 22px;
}

.field-hint {
  color: #6b7280;
  font-size: 12px;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-alert {
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.form-alert.error {
  background: #fef2f2;
  color: #991b1b;
}

.form-alert.success {
  background: #ecfdf5;
  color: #166534;
}

.entity-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #1a5c9e;
  color: white;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #eef4fb;
  color: #1a5c9e;
}

@media (max-width: 640px) {
  .entity-form-section {
    padding: 1rem;
  }

  .entity-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
