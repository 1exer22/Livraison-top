<template>
  <div class="sales-chart">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'px-3 py-1 rounded-full text-sm',
            selectedPeriod === period.value
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700',
          ]"
        >
          {{ period.label }}
        </button>
      </div>
      <div class="flex items-center text-sm text-gray-500">
        <span class="font-medium text-gray-900">{{ totalRevenue }}</span>
        <span class="ml-2">de revenu total</span>
      </div>
    </div>

    <!-- Chart container -->
    <div class="h-64" ref="chartContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const chartContainer = ref(null);
const chart = ref(null);
const selectedPeriod = ref("week");

const periods = [
  { label: "7 jours", value: "week" },
  { label: "30 jours", value: "month" },
  { label: "12 mois", value: "year" },
];

const totalRevenue = computed(() => {
  const total = props.data.reduce((sum, item) => sum + item.revenue, 0);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(total);
});

const initChart = () => {
  const ctx = chartContainer.value.getContext("2d");

  chart.value = new Chart(ctx, {
    type: "line",
    data: {
      labels: props.data.map((item) => item.date),
      datasets: [
        {
          label: "Revenus",
          data: props.data.map((item) => item.revenue),
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          tension: 0.4,
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
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) => {
              return new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(context.raw);
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(value);
            },
          },
        },
      },
    },
  });
};

const updateChart = () => {
  if (chart.value) {
    chart.value.data.labels = props.data.map((item) => item.date);
    chart.value.data.datasets[0].data = props.data.map((item) => item.revenue);
    chart.value.update();
  }
};

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
