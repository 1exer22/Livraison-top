i
<template>
  <div class="top-performers">
    <div class="space-y-4">
      <div v-for="(item, index) in items" :key="item.id" class="performer-item">
        <div class="flex items-center">
          <div class="rank">{{ index + 1 }}</div>
          <div class="flex-shrink-0">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
          </div>
          <div class="ml-4 flex-grow">
            <h3 class="font-medium">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">{{ getSubtitle(item) }}</p>
          </div>
          <div class="text-right">
            <div class="font-medium">{{ formatValue(item.value) }}</div>
            <div
              :class="[
                'text-sm',
                item.trend >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              <i
                :class="
                  item.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(item.trend) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ["restaurant", "dish", "zone"].includes(value),
  },
});

const getSubtitle = (item) => {
  switch (props.type) {
    case "restaurant":
      return `${item.orderCount} commandes`;
    case "dish":
      return `${item.quantity} vendus`;
    case "zone":
      return `${item.orderCount} livraisons`;
    default:
      return "";
  }
};

const formatValue = (value) => {
  if (props.type === "restaurant" || props.type === "dish") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }
  return value;
};
</script>

<style lang="scss" scoped>
.performer-item {
  @apply bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow duration-200;
}

.rank {
  @apply w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center 
         text-sm font-medium text-gray-600 mr-4;
}
</style>
