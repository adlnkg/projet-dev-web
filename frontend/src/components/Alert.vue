<template>
  <Transition name="fade">
    <div v-if="message" :class="['alert', `alert-${type}`]">
      <div class="alert-content">
        <span class="alert-icon">
          <i :class="iconClass"></i>
        </span>
        <span class="alert-text">{{ message }}</span>
        <button class="alert-close" @click="closeAlert" type="button">
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  }
})

const emit = defineEmits(['close'])

const iconClass = computed(() => {
  const icons = {
    success: 'pi pi-check-circle',
    error: 'pi pi-exclamation-circle',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle'
  }
  return icons[props.type] || icons.info
})

const closeAlert = () => {
  emit('close')
}
</script>

<style scoped>
.alert {
  display: flex;
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.alert-icon {
  display: flex;
  font-size: 18px;
  flex-shrink: 0;
}

.alert-text {
  flex: 1;
  line-height: 1.4;
}

.alert-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  padding: 4px;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

/* Success */
.alert-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  border-left: 4px solid #10b981;
  color: #065f46;
}

.alert-success .alert-icon {
  color: #10b981;
}

/* Error */
.alert-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border-left: 4px solid #ef4444;
  color: #7f1d1d;
}

.alert-error .alert-icon {
  color: #ef4444;
}

/* Warning */
.alert-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
  border-left: 4px solid #f59e0b;
  color: #78350f;
}

.alert-warning .alert-icon {
  color: #f59e0b;
}

/* Info */
.alert-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border-left: 4px solid #3b82f6;
  color: #1e3a8a;
}

.alert-info .alert-icon {
  color: #3b82f6;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
