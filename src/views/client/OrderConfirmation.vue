<template>
  <div class="order-confirmation max-w-2xl mx-auto p-4">
    <div class="text-center mb-8">
      <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
      <h1 class="text-3xl font-bold">Commande confirmée !</h1>
      <p class="text-gray-600 mt-2">Votre commande a été validée et est en cours de préparation.</p>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="order-details">
        <h2 class="text-xl font-bold mb-4">Détails de la commande</h2>
        
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Numéro de commande</span>
            <span class="font-mono">{{ order.id }}</span>
          </div>
          
          <div class="flex justify-between">
            <span>Statut</span>
            <span class="status-badge">{{ order.status }}</span>
          </div>

          <div class="border-t pt-4 mt-4">
            <h3 class="font-bold mb-2">Articles commandés</h3>
            <div v-for="item in order.items" :key="item.id" class="flex justify-between">
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span>{{ (item.price * item.quantity).toFixed(2) }}€</span>
            </div>
          </div>

          <div class="border-t pt-4 mt-4">
            <div class="flex justify-between mb-2">
              <span>Total</span>
              <span class="font-bold">{{ order.total.toFixed(2) }}€</span>
            </div>
          </div>
        </div>
      </div>

      <div class="delivery-tracking mt-8">
        <h2 class="text-xl font-bold mb-4">Suivi de livraison</h2>
        <div class="tracking-timeline">
          <!-- Timeline de suivi -->
          <div v-for="(step, index) in deliverySteps" :key="index"
            class="step-item"
            :class="{ 'completed': isStepCompleted(step.status) }"
          >
            <div class="step-icon">
              <i :class="step.icon"></i>
            </div>
            <div class="step-content">
              <h4 class="font-bold">{{ step.title }}</h4>
              <p class="text-sm text-gray-600">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const orderStore = useOrderStore()
const order = ref(null)

const deliverySteps = [
  {
    status: 'confirmed',
    title: 'Commande confirmée',
    description: 'Votre commande a été reçue par le restaurant',
    icon: 'fas fa-check'
  },
  {
    status: 'preparing',
    title: 'En préparation',
    description: 'Le restaurant prépare votre commande',
    icon: 'fas fa-utensils'
  },
  {
    status: 'delivering',
    title: 'En livraison',
    description: 'Votre commande est en route',
    icon: 'fas fa-motorcycle'
  },
  {
    status: 'delivered',
    title: 'Livrée',
    description: 'Bon appétit !',
    icon: 'fas fa-home'
  }
]

const isStepCompleted = (status) => {
  const statusIndex = deliverySteps.findIndex(step => step.status === status)
  const currentStatusIndex = deliverySteps.findIndex(step => step.status === order.value?.status)
  return statusIndex <= currentStatusIndex
}

onMounted(async () => {
  const orderId = route.params.orderId
  order.value = await orderStore.getOrder(orderId)
})
</script>

<style lang="scss" scoped>
.status-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
  &.confirmed { @apply bg-green-100 text-green-800; }
  &.preparing { @apply bg-yellow-100 text-yellow-800; }
  &.delivering { @apply bg-blue-100 text-blue-800; }
  &.delivered { @apply bg-gray-100 text-gray-800; }
}

.tracking-timeline {
  @apply space-y-4;
}

.step-item {
  @apply flex items-start gap-4;
  
  .step-icon {
    @apply w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center;
    &.completed {
      @apply bg-green-500 text-white;
    }
  }
}
</style>
