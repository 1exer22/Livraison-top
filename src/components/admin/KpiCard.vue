<template>
  <div class="kpi-card bg-white rounded-lg shadow-sm p-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="mt-2 text-3xl font-semibold">{{ value }}</p>
      </div>
      <div :class="['icon-wrapper', iconColor]">
        <i :class="icon"></i>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex items-center">
        <span
          :class="[
            'text-sm font-medium',
            trend >= 0 ? 'text-green-600' : 'text-red-600',
          ]"
        >
          <i :class="trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(trend) }}%
        </span>
        <span class="ml-2 text-sm text-gray-500">vs période précédente</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: "bg-primary-100 text-primary-500",
  },
  trend: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss" scoped>
.icon-wrapper {
  @apply p-3 rounded-full;

  i {
    @apply text-xl;
  }
}
</style>
