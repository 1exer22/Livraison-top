<template>
  <div class="dish-card bg-white rounded-lg shadow-sm border p-4">
    <div class="flex gap-4">
      <div class="dish-image">
        <img
          :src="dish.image"
          :alt="dish.name"
          class="w-24 h-24 object-cover rounded-lg"
        />
      </div>

      <div class="flex-grow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold">{{ dish.name }}</h3>
            <p class="text-sm text-gray-600">{{ dish.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <switch-toggle
              v-model="dish.available"
              @change="$emit('toggle-availability', dish)"
            />
            <button
              @click="$emit('edit', dish)"
              class="text-gray-500 hover:text-primary-500"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="$emit('delete', dish.id)"
              class="text-gray-500 hover:text-red-500"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="mt-4">
          <div class="flex justify-between items-center">
            <span class="font-bold">{{ formatPrice(dish.price) }}</span>
            <span
              :class="[
                'status-badge',
                dish.available ? 'available' : 'unavailable',
              ]"
            >
              {{ dish.available ? "Disponible" : "Indisponible" }}
            </span>
          </div>
        </div>

        <div v-if="dish.options?.length" class="mt-2">
          <p class="text-sm text-gray-600">Options :</p>
          <div class="flex flex-wrap gap-2 mt-1">
            <span
              v-for="option in dish.options"
              :key="option.id"
              class="text-xs bg-gray-100 px-2 py-1 rounded"
            >
              {{ option.name }} (+{{ formatPrice(option.price) }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SwitchToggle from "../components/common/SwitchToggle.vue";

const props = defineProps({
  dish: {
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

defineEmits(["edit", "delete", "toggle-availability"]);
</script>

<style lang="scss" scoped>
.status-badge {
  @apply text-xs px-2 py-1 rounded-full;

  &.available {
    @apply bg-green-100 text-green-800;
  }

  &.unavailable {
    @apply bg-red-100 text-red-800;
  }
}
</style>
