<template>
  <div class="menu-items grid gap-4">
    <div v-for="item in items" :key="item.id" class="menu-item">
      <div class="flex gap-4">
        <img :src="item.image" :alt="item.name" class="w-24 h-24 object-cover rounded-lg">
        <div class="flex-grow">
          <h3 class="text-xl font-semibold">{{ item.name }}</h3>
          <p class="text-gray-600">{{ item.description }}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-lg font-bold">{{ item.price }}€</span>
            <button 
              @click="$emit('add-to-cart', item)"
              class="add-to-cart-btn"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})

defineEmits(['add-to-cart'])
</script>

<style lang="scss" scoped>
.menu-item {
  @apply bg-white p-4 rounded-lg shadow-sm;
}

.add-to-cart-btn {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors;
}
</style>
