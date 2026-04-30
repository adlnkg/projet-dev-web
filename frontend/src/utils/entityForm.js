const INPUT_PADDING = (value) => String(value).padStart(2, '0')

export function groupFieldsBySection(fields = []) {
  return fields.reduce((accumulator, field) => {
    const section = field.section || 'general'
    if (!accumulator[section]) {
      accumulator[section] = []
    }
    accumulator[section].push(field)
    return accumulator
  }, {})
}

export function formatDateTimeInputValue(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return [
    date.getFullYear(),
    INPUT_PADDING(date.getMonth() + 1),
    INPUT_PADDING(date.getDate()),
  ].join('-') + `T${INPUT_PADDING(date.getHours())}:${INPUT_PADDING(date.getMinutes())}`
}

export function getFieldInitialValue(field) {
  if (field.value === null || field.value === undefined) return ''

  if (field.kind === 'datetime') {
    return formatDateTimeInputValue(field.value)
  }

  return field.value
}

export function buildFormState(fields = []) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.key] = getFieldInitialValue(field)
    return accumulator
  }, {})
}

export function buildUpdatePayload(fields = [], values = {}) {
  return fields.reduce((payload, field) => {
    if (!field.editable || field.readOnly) return payload

    const rawValue = values[field.key]
    if (rawValue === '' || rawValue === null || rawValue === undefined) return payload

    if (field.kind === 'number') {
      const numericValue = Number(rawValue)
      if (Number.isNaN(numericValue)) return payload
      payload[field.key] = numericValue
      return payload
    }

    if (field.kind === 'datetime') {
      const date = new Date(rawValue)
      if (Number.isNaN(date.getTime())) return payload
      payload[field.key] = date.toISOString()
      return payload
    }

    payload[field.key] = String(rawValue)
    return payload
  }, {})
}

export function getFieldDisplayValue(field) {
  if (field.value === null || field.value === undefined || field.value === '') {
    return 'Non renseigné'
  }

  if (field.kind === 'datetime') {
    const date = new Date(field.value)
    if (Number.isNaN(date.getTime())) return String(field.value)

    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (Array.isArray(field.value)) {
    return field.value.join(', ')
  }

  if (typeof field.value === 'object') {
    return JSON.stringify(field.value)
  }

  return String(field.value)
}
