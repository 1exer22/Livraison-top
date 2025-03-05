<template>
  <div class="categories-scroll">
    <button
      v-for="category in categories"
      :key="category.id"
      @click="$emit('select-category', category.id)"
      :class="['category-btn', { active: selectedCategory === category.id }]"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const selectedCategory = ref(null)
defineEmits(['select-category'])
</script>

<style lang="scss" scoped>
.categories-scroll {
  @apply flex overflow-x-auto gap-4 py-4 sticky top-0 bg-white z-10;
}

.category-btn {
  @apply px-4 py-2 rounded-full whitespace-nowrap;
  &.active {
    @apply bg-primary-500 text-white;
  }
}
</style>
