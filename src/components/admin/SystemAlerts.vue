<template>
  <div class="system-alerts space-y-4">
    <div 
      v-for="alert in alerts" 
      :key="alert.id"
      :class="['alert-item', alert.severity]"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <i :class="getAlertIcon(alert.severity)"></i>
          <div>
            <h4 class="font-medium">{{ alert.title }}</h4>
            <p class="text-sm">{{ alert.message }}</p>
            <span class="text-xs text-gray-500">
              {{ formatDate(alert.createdAt) }}
            </span>
          </div>
        </div>
        <button 
          @click="$emit('resolve', alert.id)"
          class="text-gray-500 hover:text-gray-700"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  alerts: {
    type: Array,
    required: true
  }
})

defineEmits(['resolve'])

const getAlertIcon = (severity) => {
  const icons = {
    critical: 'fas fa-exclamation-circle text-red-500',
    warning: 'fas fa-exclamation-triangle text-yellow-500',
    info: 'fas fa-info-circle text-blue-500'
  }
  return icons[severity] || icons.info
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR')
}
</script>

<style lang="scss" scoped>
.alert-item {
  @apply p-4 rounded-lg;

  &.critical {
    @apply bg-red-50 border border-red-200;
  }

  &.warning {
    @apply bg-yellow-50 border border-yellow-200;
  }

  &.info {
    @apply bg-blue-50 border border-blue-200;
  }
}
</style>
