<template>
  <div class="orders-distribution">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <span class="font-medium">{{ totalOrders }}</span>
        <span class="ml-2 text-sm text-gray-500">commandes au total</span>
      </div>
      <select v-model="selectedView" class="form-select">
        <option value="status">Par statut</option>
        <option value="time">Par heure</option>
        <option value="type">Par type</option>
      </select>
    </div>

    <!-- Chart container -->
    <div class="h-64" ref="chartContainer"></div>

    <!-- Légende -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div
        v-for="item in legendItems"
        :key="item.label"
        class="flex items-center"
      >
        <span
          class="w-3 h-3 rounded-full mr-2"
          :style="{ backgroundColor: item.color }"
        ></span>
        <span class="text-sm text-gray-600">{{ item.label }}</span>
        <span class="ml-auto font-medium">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const chartContainer = ref(null);
const chart = ref(null);
const selectedView = ref("status");

const totalOrders = computed(() => {
  return Object.values(props.data[selectedView.value].values).reduce(
    (a, b) => a + b,
    0
  );
});

const legendItems = computed(() => {
  const currentData = props.data[selectedView.value];
  return Object.entries(currentData.values).map(([label, value], index) => ({
    label,
    value,
    color: currentData.colors[index],
  }));
});

const initChart = () => {
  const ctx = chartContainer.value.getContext("2d");
  const currentData = props.data[selectedView.value];

  chart.value = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(currentData.values),
      datasets: [
        {
          data: Object.values(currentData.values),
          backgroundColor: currentData.colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value} commandes (${percentage}%)`;
            },
          },
        },
      },
      cutout: "70%",
    },
  });
};

const updateChart = () => {
  if (chart.value) {
    const currentData = props.data[selectedView.value];
    chart.value.data.labels = Object.keys(currentData.values);
    chart.value.data.datasets[0].data = Object.values(currentData.values);
    chart.value.data.datasets[0].backgroundColor = currentData.colors;
    chart.value.update();
  }
};

watch(selectedView, () => {
  updateChart();
});

watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<style lang="scss" scoped>
.form-select {
  @apply px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
</style>
