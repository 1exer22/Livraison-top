<template>
  <div class="restaurant-analytics">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
          <div class="flex gap-4">
            <select
              v-model="period"
              class="form-select"
              @change="updateAnalytics"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            <button @click="exportData" class="btn-secondary">
              <i class="fas fa-download mr-2"></i>Exporter
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Chiffre d'affaires</h3>
          <div class="mt-2 flex items-baseline">
            <p class="text-2xl font-semibold">
              {{ formatPrice(kpis.revenue) }}
            </p>
            <p
              :class="[
                'ml-2 text-sm',
                kpis.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              <i
                :class="
                  kpis.revenueTrend >= 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(kpis.revenueTrend) }}%
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Commandes</h3>
          <div class="mt-2 flex items-baseline">
            <p class="text-2xl font-semibold">{{ kpis.orders }}</p>
            <p
              :class="[
                'ml-2 text-sm',
                kpis.ordersTrend >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              <i
                :class="
                  kpis.ordersTrend >= 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(kpis.ordersTrend) }}%
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Panier moyen</h3>
          <div class="mt-2 flex items-baseline">
            <p class="text-2xl font-semibold">
              {{ formatPrice(kpis.averageOrder) }}
            </p>
            <p
              :class="[
                'ml-2 text-sm',
                kpis.averageOrderTrend >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              <i
                :class="
                  kpis.averageOrderTrend >= 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(kpis.averageOrderTrend) }}%
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Note moyenne</h3>
          <div class="mt-2 flex items-baseline">
            <p class="text-2xl font-semibold">{{ kpis.rating }}/5</p>
            <p
              :class="[
                'ml-2 text-sm',
                kpis.ratingTrend >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              <i
                :class="
                  kpis.ratingTrend >= 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(kpis.ratingTrend) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Évolution des ventes -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">Évolution des ventes</h2>
          <sales-chart :data="salesData" />
        </div>

        <!-- Répartition des commandes -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">Répartition des commandes</h2>
          <orders-distribution-chart :data="ordersDistribution" />
        </div>
      </div>

      <!-- Analyses détaillées -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Top produits -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">Produits les plus vendus</h2>
          <div class="space-y-4">
            <div
              v-for="product in topProducts"
              :key="product.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded-lg mr-3"
                />
                <div>
                  <h3 class="font-medium">{{ product.name }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ product.quantity }} vendus
                  </p>
                </div>
              </div>
              <span class="font-medium">{{
                formatPrice(product.revenue)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Heures de pointe -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">Heures de pointe</h2>
          <peak-hours-chart :data="peakHoursData" />
        </div>

        <!-- Zones de livraison -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">Zones de livraison</h2>
          <delivery-zones-chart :data="deliveryZonesData" />
        </div>
      </div>

      <!-- Tableau détaillé -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-6 border-b">
          <h2 class="text-lg font-medium">Détail des commandes</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Commande
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Montant
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Note
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in orders" :key="order.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ formatDate(order.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">#{{ order.number }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ order.customer }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ formatPrice(order.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <status-badge :status="order.status" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">★</span>
                    {{ order.rating }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t">
          <pagination
            :total="totalOrders"
            :per-page="perPage"
            :current-page="currentPage"
            @page-change="changePage"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRestaurantStore } from "@/stores/restaurant";
import SalesChart from "@/components/charts/SalesChart.vue";
import OrdersDistributionChart from "@/components/charts/OrdersDistributionChart.vue";
// import PeakHoursChart from "@/components/charts/PeakHoursChart.vue";
// import DeliveryZonesChart from "@/components/charts/DeliveryZonesChart.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import Pagination from "@/components/common/Pagination.vue";

const restaurantStore = useRestaurantStore();

// États
const period = ref("month");
const currentPage = ref(1);
const perPage = ref(10);
const totalOrders = ref(0);

const kpis = ref({
  revenue: 0,
  revenueTrend: 0,
  orders: 0,
  ordersTrend: 0,
  averageOrder: 0,
  averageOrderTrend: 0,
  rating: 0,
  ratingTrend: 0,
});

const salesData = ref([]);
const ordersDistribution = ref([]);
const topProducts = ref([]);
const peakHoursData = ref([]);
const deliveryZonesData = ref([]);
const orders = ref([]);

// Méthodes
const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

const updateAnalytics = async () => {
  try {
    const data = await restaurantStore.getAnalytics({
      period: period.value,
    });

    kpis.value = data.kpis;
    salesData.value = data.salesData;
    ordersDistribution.value = data.ordersDistribution;
    topProducts.value = data.topProducts;
    peakHoursData.value = data.peakHours;
    deliveryZonesData.value = data.deliveryZones;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des analytics:", error);
  }
};

const exportData = async () => {
  try {
    await restaurantStore.exportAnalytics({
      period: period.value,
    });
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
  }
};

const loadOrders = async () => {
  try {
    const result = await restaurantStore.getOrders({
      page: currentPage.value,
      perPage: perPage.value,
    });
    orders.value = result.orders;
    totalOrders.value = result.total;
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  }
};

const changePage = (page) => {
  currentPage.value = page;
  loadOrders();
};

onMounted(() => {
  updateAnalytics();
  loadOrders();
});
</script>

<style lang="scss" scoped>
.form-select {
  @apply px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}
</style>
