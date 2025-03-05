<template>
  <div class="delivery-card bg-white border rounded-lg p-4">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="font-bold">{{ delivery.restaurant.name }}</h3>
        <p class="text-sm text-gray-600">Commande #{{ delivery.orderNumber }}</p>
      </div>
      <div class="text-right">
        <span class="font-bold">{{ formatPrice(delivery.earnings) }}</span>
        <p class="text-sm text-gray-600">{{ delivery.distance }}km</p>
      </div>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-start gap-2">
        <i class="fas fa-store-alt text-gray-400 mt-1"></i>
        <div>
          <p class="font-medium">Récupération</p>
          <p class="text-sm text-gray-600">{{ delivery.restaurant.address }}</p>
        </div>
      </div>
      <div class="flex items-start gap-2">
        <i class="fas fa-map-marker-alt text-gray-400 mt-1"></i>
        <div>
          <p class="font-medium">Livraison</p>
          <p class="text-sm text-gray-600">{{ delivery.deliveryAddress }}</p>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-gray-600">
        Temps estimé: {{ delivery.estimatedTime }}min
      </span>
      <button 
        @click="$emit('accept', delivery)"
        class="btn-primary"
      >
        Accepter
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  delivery: {
    type: Object,
    required: true
  }
})

defineEmits(['accept'])

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600;
}
</style>
