<template>
  <div class="current-delivery">
    <div class="delivery-progress mb-4">
      <div class="steps">
        <div 
          v-for="(step, index) in deliverySteps" 
          :key="step.status"
          :class="['step', { 'completed': isStepCompleted(step.status) }]"
        >
          <div class="step-icon">
            <i :class="step.icon"></i>
          </div>
          <div class="step-content">
            <p class="font-medium">{{ step.label }}</p>
            <p class="text-sm text-gray-600">{{ getStepTime(step.status) }}</p>
          </div>
          <div v-if="index < deliverySteps.length - 1" class="step-line"></div>
        </div>
      </div>
    </div>

    <div class="delivery-actions space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold">{{ delivery.restaurant.name }}</h3>
          <p class="text-sm text-gray-600">Commande #{{ delivery.orderNumber }}</p>
        </div>
        <button 
          v-if="canComplete"
          @click="$emit('complete')"
          class="btn-success"
        >
          Terminer la livraison
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <a 
          :href="getGoogleMapsUrl(currentAddress)"
          target="_blank"
          class="btn-secondary"
        >
          <i class="fas fa-directions mr-2"></i>Navigation
        </a>
        <button 
          @click="contactCustomer"
          class="btn-secondary"
        >
          <i class="fas fa-phone mr-2"></i>Contacter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  delivery: {
    type: Object,
    required: true
  }
})

const deliverySteps = [
  {
    status: 'accepted',
    label: 'En route restaurant',
    icon: 'fas fa-motorcycle'
  },
  {
    status: 'picked_up',
    label: 'Commande récupérée',
    icon: 'fas fa-shopping-bag'
  },
  {
    status: 'delivering',
    label: 'En livraison',
    icon: 'fas fa-route'
  },
  {
    status: 'delivered',
    label: 'Livré',
    icon: 'fas fa-check'
  }
]

const currentAddress = computed(() => {
  if (props.delivery.status === 'accepted') {
    return props.delivery.restaurant.address
  }
  return props.delivery.deliveryAddress
})

const canComplete = computed(() => {
  return props.delivery.status === 'delivering'
})

const isStepCompleted = (status) => {
  const currentIndex = deliverySteps.findIndex(step => step.status === props.delivery.status)
  const stepIndex = deliverySteps.findIndex(step => step.status === status)
  return stepIndex <= currentIndex
}

const getStepTime = (status) => {
  const timestamp = props.delivery.statusHistory?.find(h => h.status === status)?.timestamp
  return timestamp ? new Date(timestamp).toLocaleTimeString() : ''
}

const getGoogleMapsUrl = (address) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

const contactCustomer = () => {
  window.location.href = `tel:${props.delivery.customer.phone}`
}

defineEmits(['complete', 'update-status'])
</script>

<style lang="scss" scoped>
.delivery-progress {
  .steps {
    @apply space-y-4;
  }

  .step {
    @apply flex items-center relative;

    &.completed {
      .step-icon {
        @apply bg-green-500 text-white;
      }
      .step-line {
        @apply bg-green-500;
      }
    }
  }

  .step-icon {
    @apply w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3;
  }

  .step-line {
    @apply absolute left-4 top-8 w-0.5 h-8 bg-gray-200 -z-10;
  }
}

.btn-success {
  @apply bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
         flex items-center justify-center;
}
</style>
