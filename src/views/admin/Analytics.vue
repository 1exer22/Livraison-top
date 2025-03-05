<template>
  <div class="analytics">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Rapports & Analytics</h1>
          <div class="flex gap-4">
            <!-- Sélecteur de période -->
            <select
              v-model="period"
              class="form-select"
              @change="updateReports"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            <!-- Export des données -->
            <button @click="exportData" class="btn-secondary">
              <i class="fas fa-download mr-2"></i>Exporter
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- KPIs principaux -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <kpi-card
          title="Chiffre d'affaires"
          :value="formatPrice(kpis.revenue)"
          :trend="kpis.revenueTrend"
          icon="fas fa-euro-sign"
        />
        <kpi-card
          title="Commandes"
          :value="kpis.orders"
          :trend="kpis.ordersTrend"
          icon="fas fa-shopping-cart"
        />
        <kpi-card
          title="Panier moyen"
          :value="formatPrice(kpis.averageOrder)"
          :trend="kpis.averageOrderTrend"
          icon="fas fa-shopping-basket"
        />
        <kpi-card
          title="Nouveaux clients"
          :value="kpis.newCustomers"
          :trend="kpis.customersTrend"
          icon="fas fa-users"
        />
      </div>

      <!-- Graphiques principaux -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Graphique des ventes -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Évolution des ventes</h2>
          <sales-chart :data="salesData" />
        </div>

        <!-- Répartition des commandes -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Répartition des commandes</h2>
          <orders-distribution-chart :data="ordersDistribution" />
        </div>
      </div>

      <!-- Analyses détaillées -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Top restaurants -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Top Restaurants</h2>
          <top-performers-list :items="topRestaurants" type="restaurant" />
        </div>

        <!-- Top plats -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Plats les plus vendus</h2>
          <top-performers-list :items="topDishes" type="dish" />
        </div>

        <!-- Zones actives -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Zones les plus actives</h2>
          <top-performers-list :items="topZones" type="zone" />
        </div>
      </div>

      <!-- Rapports détaillés -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">Rapports détaillés</h2>
            <div class="flex gap-4">
              <select v-model="reportType" class="form-select">
                <option value="sales">Ventes</option>
                <option value="restaurants">Restaurants</option>
                <option value="customers">Clients</option>
                <option value="drivers">Livreurs</option>
              </select>
              <button @click="generateReport" class="btn-primary">
                Générer
              </button>
            </div>
          </div>
        </div>

        <!-- Tableau des données -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr>
                <th
                  v-for="column in reportColumns"
                  :key="column.key"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="row in reportData"
                :key="row.id"
                class="hover:bg-gray-50"
              >
                <td
                  v-for="column in reportColumns"
                  :key="column.key"
                  class="px-6 py-4 whitespace-nowrap"
                >
                  <template v-if="column.type === 'currency'">
                    {{ formatPrice(row[column.key]) }}
                  </template>
                  <template v-else-if="column.type === 'date'">
                    {{ formatDate(row[column.key]) }}
                  </template>
                  <template v-else-if="column.type === 'percentage'">
                    {{ formatPercentage(row[column.key]) }}
                  </template>
                  <template v-else>
                    {{ row[column.key] }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t">
          <pagination
            :total="totalReportItems"
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
import { ref, computed, onMounted, watch } from "vue";
import { useAdminStore } from "@/stores/admin";
import KpiCard from "@/components/admin/KpiCard.vue";
import SalesChart from "@/components/charts/SalesChart.vue";
import OrdersDistributionChart from "@/components/charts/OrdersDistributionChart.vue";
import TopPerformersList from "@/components/admin/TopPerformersList.vue";
import Pagination from "@/components/common/Pagination.vue";

const adminStore = useAdminStore();

// États
const period = ref("month");
const reportType = ref("sales");
const currentPage = ref(1);
const perPage = ref(10);
const totalReportItems = ref(0);

const kpis = ref({
  revenue: 0,
  orders: 0,
  averageOrder: 0,
  newCustomers: 0,
  revenueTrend: "+0%",
  ordersTrend: "+0%",
  averageOrderTrend: "+0%",
  customersTrend: "+0%",
});

const salesData = ref([]);
const ordersDistribution = ref([]);
const topRestaurants = ref([]);
const topDishes = ref([]);
const topZones = ref([]);
const reportData = ref([]);

// Colonnes des rapports
const reportColumns = computed(() => {
  const columns = {
    sales: [
      { key: "date", label: "Date", type: "date" },
      { key: "orders", label: "Commandes", type: "number" },
      { key: "revenue", label: "Chiffre d'affaires", type: "currency" },
      { key: "averageOrder", label: "Panier moyen", type: "currency" },
      { key: "commission", label: "Commission", type: "currency" },
    ],
    restaurants: [
      { key: "name", label: "Restaurant", type: "text" },
      { key: "orders", label: "Commandes", type: "number" },
      { key: "revenue", label: "Ventes", type: "currency" },
      { key: "rating", label: "Note", type: "number" },
      {
        key: "completionRate",
        label: "Taux de complétion",
        type: "percentage",
      },
    ],
    customers: [
      { key: "name", label: "Client", type: "text" },
      { key: "orders", label: "Commandes", type: "number" },
      { key: "totalSpent", label: "Total dépensé", type: "currency" },
      { key: "lastOrder", label: "Dernière commande", type: "date" },
      { key: "averageOrder", label: "Panier moyen", type: "currency" },
    ],
    drivers: [
      { key: "name", label: "Livreur", type: "text" },
      { key: "deliveries", label: "Livraisons", type: "number" },
      { key: "earnings", label: "Gains", type: "currency" },
      { key: "rating", label: "Note", type: "number" },
      { key: "onTimeRate", label: "Taux de ponctualité", type: "percentage" },
    ],
  };
  return columns[reportType.value];
});

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

const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

const updateReports = async () => {
  try {
    const data = await adminStore.getAnalyticsData({
      period: period.value,
    });

    kpis.value = data.kpis;
    salesData.value = data.salesData;
    ordersDistribution.value = data.ordersDistribution;
    topRestaurants.value = data.topRestaurants;
    topDishes.value = data.topDishes;
    topZones.value = data.topZones;
  } catch (error) {
    console.error("Erreur lors du chargement des analytics:", error);
  }
};

const generateReport = async () => {
  try {
    const result = await adminStore.getDetailedReport({
      type: reportType.value,
      period: period.value,
      page: currentPage.value,
      perPage: perPage.value,
    });

    reportData.value = result.data;
    totalReportItems.value = result.total;
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
  }
};

const exportData = async () => {
  try {
    await adminStore.exportReport({
      type: reportType.value,
      period: period.value,
    });
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
  }
};

const changePage = (page) => {
  currentPage.value = page;
  generateReport();
};

// Surveillance des changements
watch([period, reportType], () => {
  currentPage.value = 1;
  generateReport();
});

// Chargement initial
onMounted(() => {
  updateReports();
  generateReport();
});
</script>

<style lang="scss" scoped>
.form-select {
  @apply px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 
         flex items-center transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
         flex items-center transition-colors duration-200;
}
</style>
