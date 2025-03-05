<template>
  <div class="restaurant-card">
    <img :src="restaurant.image" :alt="restaurant.name" class="w-full h-48 object-cover rounded-t-lg">
    <div class="p-4">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-bold">{{ restaurant.name }}</h3>
        <div class="rating flex items-center">
          <span class="text-yellow-500">★</span>
          <span>{{ restaurant.rating }}/5</span>
        </div>
      </div>
      <p class="text-gray-600">{{ restaurant.cuisine }}</p>
      <div class="flex items-center mt-2">
        <i class="fas fa-clock mr-2"></i>
        <span>{{ restaurant.deliveryTime }} min</span>
        <i class="fas fa-motorcycle mx-2"></i>
        <span>{{ restaurant.deliveryFee }}€</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  restaurant: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.restaurant-card {
  @apply bg-white rounded-lg shadow-lg transition-transform hover:scale-105;
}
</style>
