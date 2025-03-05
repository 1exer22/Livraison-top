<template>
  <div class="restaurant-list-page">
    <search-filters @filter-change="handleFilters" />
    
    <div class="restaurant-grid">
      <restaurant-card
        v-for="restaurant in filteredRestaurants"
        :key="restaurant.id"
        :restaurant="restaurant"
        @click="navigateToRestaurant(restaurant.id)"
      />
    </div>

    <div v-if="loading" class="loading-spinner">
      <span class="sr-only">Chargement...</span>
    </div>

    <div v-if="!loading && filteredRestaurants.length === 0" class="no-results">
      Aucun restaurant ne correspond à vos critères
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchFilters from '@/components/client/SearchFilters.vue'
import RestaurantCard from '@/components/client/RestaurantCard.vue'
import { useRestaurantStore } from '@/stores/restaurant'

const router = useRouter()
const restaurantStore = useRestaurantStore()
const loading = ref(false)
const filteredRestaurants = ref([])

const handleFilters = async (filters) => {
  loading.value = true
  try {
    filteredRestaurants.value = await restaurantStore.searchRestaurants(filters)
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
  } finally {
    loading.value = false
  }
}

const navigateToRestaurant = (id) => {
  router.push(`/restaurant/${id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    filteredRestaurants.value = await restaurantStore.getAllRestaurants()
  } catch (error) {
    console.error('Erreur lors du chargement des restaurants:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.restaurant-list-page {
  @apply container mx-auto px-4 py-8;
}

.restaurant-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8;
}

.loading-spinner {
  @apply flex justify-center items-center min-h-[200px];
}

.no-results {
  @apply text-center text-gray-500 mt-8;
}
</style>
