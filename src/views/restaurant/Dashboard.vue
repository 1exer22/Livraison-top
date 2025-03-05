<template>
  <div class="restaurant-dashboard">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard Restaurant</h1>
          <div class="restaurant-status">
            <toggle-switch
              v-model="isOpen"
              @change="updateRestaurantStatus"
              label="Restaurant ouvert"
            />
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <stat-card
          title="Commandes aujourd'hui"
          :value="stats.todayOrders"
          icon="fas fa-shopping-bag"
          trend="+12%"
        />
        <stat-card
          title="Chiffre d'affaires"
          :value="formatCurrency(stats.todayRevenue)"
          icon="fas fa-euro-sign"
          trend="+8%"
        />
        <stat-card
          title="Temps moyen de préparation"
          :value="stats.avgPrepTime + ' min'"
          icon="fas fa-clock"
          trend="-2min"
        />
        <stat-card
          title="Note moyenne"
          :value="stats.rating + '/5'"
          icon="fas fa-star"
          trend="+0.2"
        />
      </div>

      <!-- Commandes en cours -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-4 border-b">
              <h2 class="text-lg font-semibold">Commandes en cours</h2>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <order-card
                  v-for="order in activeOrders"
                  :key="order.id"
                  :order="order"
                  @status-change="updateOrderStatus"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications et alertes -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Notifications</h2>
          </div>
          <div class="p-4">
            <notification-list :notifications="notifications" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRestaurantStore } from "@/stores/restaurant";
import StatCard from "@/components/restaurant/StatCard.vue";
import OrderCard from "@/components/restaurant/OrderCard.vue";
// import NotificationList fro     m '@/components/restaurant/NotificationList.vue'
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

const restaurantStore = useRestaurantStore();
const isOpen = ref(false);
const stats = ref({
  todayOrders: 0,
  todayRevenue: 0,
  avgPrepTime: 0,
  rating: 0,
});
const activeOrders = ref([]);
const notifications = ref([]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

const updateRestaurantStatus = async (status) => {
  try {
    await restaurantStore.updateStatus(status);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    await restaurantStore.updateOrderStatus(orderId, status);
    // Rafraîchir les commandes actives
    loadActiveOrders();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
  }
};

const loadActiveOrders = async () => {
  try {
    activeOrders.value = await restaurantStore.getActiveOrders();
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  }
};

onMounted(async () => {
  try {
    const restaurantData = await restaurantStore.getRestaurantData();
    isOpen.value = restaurantData.isOpen;
    stats.value = await restaurantStore.getDashboardStats();
    await loadActiveOrders();
    notifications.value = await restaurantStore.getNotifications();
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  }
});
</script>
