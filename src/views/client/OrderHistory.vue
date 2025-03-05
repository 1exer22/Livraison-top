<template>
  <div class="order-history">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Historique des commandes
        </h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label>Période</label>
            <select v-model="filters.period" class="form-select">
              <option value="all">Toutes les périodes</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>

          <div class="form-group">
            <label>Statut</label>
            <select v-model="filters.status" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
              <option value="refunded">Remboursées</option>
            </select>
          </div>

          <div class="form-group">
            <label>Restaurant</label>
            <select v-model="filters.restaurant" class="form-select">
              <option value="">Tous les restaurants</option>
              <option
                v-for="restaurant in restaurants"
                :key="restaurant.id"
                :value="restaurant.id"
              >
                {{ restaurant.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>&nbsp;</label>
            <button @click="resetFilters" class="btn-secondary w-full">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="stat-card">
          <div class="stat-label">Total des commandes</div>
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div
            class="stat-trend"
            :class="stats.ordersTrend >= 0 ? 'positive' : 'negative'"
          >
            <i
              :class="
                stats.ordersTrend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
              "
            ></i>
            {{ Math.abs(stats.ordersTrend) }}% vs période précédente
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Montant total</div>
          <div class="stat-value">{{ formatPrice(stats.totalSpent) }}</div>
          <div
            class="stat-trend"
            :class="stats.spentTrend >= 0 ? 'positive' : 'negative'"
          >
            <i
              :class="
                stats.spentTrend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
              "
            ></i>
            {{ Math.abs(stats.spentTrend) }}% vs période précédente
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Panier moyen</div>
          <div class="stat-value">{{ formatPrice(stats.averageOrder) }}</div>
          <div
            class="stat-trend"
            :class="stats.avgOrderTrend >= 0 ? 'positive' : 'negative'"
          >
            <i
              :class="
                stats.avgOrderTrend >= 0
                  ? 'fas fa-arrow-up'
                  : 'fas fa-arrow-down'
              "
            ></i>
            {{ Math.abs(stats.avgOrderTrend) }}% vs période précédente
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Points fidélité gagnés</div>
          <div class="stat-value">{{ stats.loyaltyPoints }}</div>
          <div class="stat-trend positive">
            <i class="fas fa-star"></i>
            {{ stats.pointsToNextReward }} points avant la prochaine récompense
          </div>
        </div>
      </div>

      <!-- Liste des commandes -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Commande
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Restaurant
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
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
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    #{{ order.number }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.items.length }} articles
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img
                      :src="order.restaurant.image"
                      class="h-8 w-8 rounded-full"
                      :alt="order.restaurant.name"
                    />
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">
                        {{ order.restaurant.name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(order.createdAt) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatTime(order.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatPrice(order.total) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <status-badge :status="order.status" />
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="viewOrderDetails(order.id)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="canReorder(order)"
                      @click="reorder(order)"
                      class="text-green-600 hover:text-green-900"
                    >
                      <i class="fas fa-redo"></i>
                    </button>
                    <button
                      v-if="canRate(order)"
                      @click="showRatingModal(order)"
                      class="text-yellow-600 hover:text-yellow-900"
                    >
                      <i class="fas fa-star"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
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

    <!-- Modals -->
    <order-details-modal
      v-if="selectedOrder"
      v-model="showOrderDetailsModal"
      :order="selectedOrder"
    />

    <rating-modal
      v-if="orderToRate"
      v-model="showRatingModal"
      :order="orderToRate"
      @submit="submitRating"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import StatusBadge from "@/components/common/StatusBadge.vue";
import Pagination from "@/components/common/Pagination.vue";
// import OrderDetailsModal from "@/components/order/OrderDetailsModal.vue";
// import RatingModal from "@/components/order/RatingModal.vue";

const router = useRouter();
const orderStore = useOrderStore();

// États
const filters = ref({
  period: "all",
  status: "",
  restaurant: "",
});

const stats = ref({
  totalOrders: 0,
  totalSpent: 0,
  averageOrder: 0,
  loyaltyPoints: 0,
  pointsToNextReward: 0,
  ordersTrend: 0,
  spentTrend: 0,
  avgOrderTrend: 0,
});

const restaurants = ref([]);
const currentPage = ref(1);
const perPage = ref(10);
const totalOrders = ref(0);
const selectedOrder = ref(null);
const orderToRate = ref(null);
const showOrderDetailsModal = ref(false);
// const showRatingModal = ref(false);

// Computed
const filteredOrders = computed(() => {
  return orderStore.orders.filter((order) => {
    const matchPeriod =
      filters.value.period === "all" ||
      isInPeriod(order.createdAt, filters.value.period);
    const matchStatus =
      !filters.value.status || order.status === filters.value.status;
    const matchRestaurant =
      !filters.value.restaurant ||
      order.restaurant.id === filters.value.restaurant;
    return matchPeriod && matchStatus && matchRestaurant;
  });
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

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isInPeriod = (date, period) => {
  const orderDate = new Date(date);
  const now = new Date();
  const periods = {
    week: 7,
    month: 30,
    year: 365,
  };
  const days = periods[period];
  const diff = (now - orderDate) / (1000 * 60 * 60 * 24);
  return diff <= days;
};

const resetFilters = () => {
  filters.value = {
    period: "all",
    status: "",
    restaurant: "",
  };
  currentPage.value = 1;
  loadOrders();
};

const viewOrderDetails = async (orderId) => {
  try {
    selectedOrder.value = await orderStore.getOrderDetails(orderId);
    showOrderDetailsModal.value = true;
  } catch (error) {
    console.error(
      "Erreur lors du chargement des détails de la commande:",
      error
    );
  }
};

const canReorder = (order) => {
  return order.status === "delivered";
};

const reorder = async (order) => {
  try {
    const newOrderId = await orderStore.reorder(order.id);
    router.push(`/checkout?orderId=${newOrderId}`);
  } catch (error) {
    console.error("Erreur lors de la recommande:", error);
  }
};

const canRate = (order) => {
  return order.status === "delivered" && !order.rated;
};

const showRatingModal = (order) => {
  orderToRate.value = order;
  showRatingModal.value = true;
};

const submitRating = async (rating) => {
  try {
    await orderStore.submitRating(orderToRate.value.id, rating);
    showRatingModal.value = false;
    orderToRate.value = null;
    loadOrders();
  } catch (error) {
    console.error("Erreur lors de la soumission de l'évaluation:", error);
  }
};

const changePage = (page) => {
  currentPage.value = page;
  loadOrders();
};

const loadOrders = async () => {
  try {
    const result = await orderStore.getOrders({
      page: currentPage.value,
      perPage: perPage.value,
      filters: filters.value,
    });
    totalOrders.value = result.total;
    stats.value = result.stats;
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  }
};

const loadRestaurants = async () => {
  try {
    restaurants.value = await orderStore.getOrderedRestaurants();
  } catch (error) {
    console.error("Erreur lors du chargement des restaurants:", error);
  }
};

onMounted(() => {
  loadOrders();
  loadRestaurants();
});
</script>

<style lang="scss" scoped>
.form-select {
  @apply w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}

.stat-card {
  @apply bg-white rounded-lg shadow-sm p-6;

  .stat-label {
    @apply text-sm text-gray-600;
  }

  .stat-value {
    @apply text-2xl font-bold mt-1;
  }

  .stat-trend {
    @apply text-sm mt-2;

    &.positive {
      @apply text-green-600;
    }

    &.negative {
      @apply text-red-600;
    }

    i {
      @apply mr-1;
    }
  }
}
</style>
