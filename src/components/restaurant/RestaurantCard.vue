<template>
  <div
    class="restaurant-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
  >
    <!-- Image du restaurant -->
    <div class="relative">
      <img
        :src="restaurant.image"
        :alt="restaurant.name"
        class="w-full h-48 object-cover"
      />
      <div
        v-if="restaurant.promotion"
        class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm"
      >
        {{ restaurant.promotion }}
      </div>
    </div>

    <!-- Informations -->
    <div class="p-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold">{{ restaurant.name }}</h3>
          <p class="text-sm text-gray-600">{{ restaurant.cuisine }}</p>
        </div>
        <div class="flex items-center">
          <span class="text-yellow-400 mr-1">★</span>
          <span class="text-sm font-medium">{{ restaurant.rating }}/5</span>
          <span class="text-sm text-gray-500 ml-1"
            >({{ restaurant.reviewCount }})</span
          >
        </div>
      </div>

      <!-- Tags et caractéristiques -->
      <div class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="tag in restaurant.tags"
          :key="tag"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Informations de livraison -->
      <div class="mt-4 flex items-center justify-between text-sm">
        <div class="flex items-center text-gray-600">
          <i class="fas fa-clock mr-1"></i>
          {{ restaurant.deliveryTime }} min
        </div>
        <div class="flex items-center text-gray-600">
          <i class="fas fa-motorcycle mr-1"></i>
          {{ formatPrice(restaurant.deliveryFee) }}
        </div>
        <div class="flex items-center text-gray-600">
          <i class="fas fa-shopping-basket mr-1"></i>
          Min. {{ formatPrice(restaurant.minimumOrder) }}
        </div>
      </div>

      <!-- Statut -->
      <div class="mt-4 flex items-center justify-between">
        <status-badge :status="restaurant.status" />
        <button
          v-if="restaurant.status === 'open'"
          class="btn-primary"
          @click="$router.push(`/restaurant/${restaurant.id}`)"
        >
          Commander
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import StatusBadge from "../components/common/StatusBadge.vue";

defineProps({
  restaurant: {
    type: Object,
    required: true,
  },
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
         transition-colors duration-200;
}
</style>
