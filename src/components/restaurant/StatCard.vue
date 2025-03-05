<template>
  <div class="stat-card bg-white rounded-lg shadow p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold mt-1">{{ value }}</p>
      </div>
      <div :class="['icon-wrapper', iconColor]">
        <i :class="icon"></i>
      </div>
    </div>
    <div class="mt-4 flex items-center">
      <span
        :class="[
          'trend-indicator',
          trend.startsWith('+') ? 'text-green-500' : 'text-red-500',
        ]"
      >
        {{ trend }}
      </span>
      <span class="text-sm text-gray-500 ml-2">vs. hier</span>
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
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  trend: {
    type: String,
    default: "0%",
  },
  iconColor: {
    type: String,
    default: "bg-primary-100 text-primary-500",
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

.trend-indicator {
  @apply text-sm font-medium;
}
</style>
