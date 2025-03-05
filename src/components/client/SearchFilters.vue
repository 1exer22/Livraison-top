<template>
  <div class="search-filters p-4 bg-white shadow-md rounded-lg">
    <div class="flex flex-wrap gap-4">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un restaurant ou un plat"
        class="search-input"
        @input="emitFilters"
      >
      
      <select v-model="selectedCuisine" class="filter-select" @change="emitFilters">
        <option value="">Toutes les cuisines</option>
        <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">
          {{ cuisine }}
        </option>
      </select>

      <div class="flex items-center gap-2">
        <input 
          v-model="priceRange" 
          type="range" 
          min="1" 
          max="4" 
          class="price-range"
          @input="emitFilters"
        >
        <span>Prix: {{ '€'.repeat(priceRange) }}</span>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <button 
        v-for="tag in filterTags"
        :key="tag"
        @click="toggleTag(tag)"
        :class="['filter-tag', { active: selectedTags.includes(tag) }]"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')
const selectedCuisine = ref('')
const priceRange = ref(2)
const selectedTags = ref([])

const cuisines = [
  'Française',
  'Italienne',
  'Japonaise',
  'Chinoise',
  'Indienne',
  'Mexicaine'
]

const filterTags = [
  'Promotion',
  'Livraison gratuite',
  'Nouveaux',
  'Végétarien',
  'Bio'
]

const emit = defineEmits(['filter-change'])

const emitFilters = () => {
  emit('filter-change', {
    query: searchQuery.value,
    cuisine: selectedCuisine.value,
    priceRange: priceRange.value,
    tags: selectedTags.value
  })
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
  emitFilters()
}
</script>

<style lang="scss" scoped>
.search-input {
  @apply px-4 py-2 border rounded-lg w-full md:w-auto flex-grow;
}

.filter-select {
  @apply px-4 py-2 border rounded-lg;
}

.filter-tag {
  @apply px-3 py-1 rounded-full border;
  &.active {
    @apply bg-primary-500 text-white;
  }
}

.price-range {
  @apply w-32;
}
</style>
