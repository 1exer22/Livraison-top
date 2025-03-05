<template>
  <div class="admin-dashboard">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900">Administration</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Statistiques globales -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <stat-card
          title="Commandes aujourd'hui"
          :value="stats.todayOrders"
          :trend="stats.ordersTrend"
          icon="fas fa-shopping-cart"
        />
        <stat-card
          title="Chiffre d'affaires"
          :value="formatPrice(stats.revenue)"
          :trend="stats.revenueTrend"
          icon="fas fa-euro-sign"
        />
        <stat-card
          title="Nouveaux utilisateurs"
          :value="stats.newUsers"
          :trend="stats.usersTrend"
          icon="fas fa-users"
        />
        <stat-card
          title="Restaurants actifs"
          :value="stats.activeRestaurants"
          :trend="stats.restaurantsTrend"
          icon="fas fa-store"
        />
      </div>

      <!-- Tableaux de bord -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Dernières commandes -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-semibold">Dernières commandes</h2>
            <router-link to="/admin/orders" class="text-primary-600 hover:text-primary-700">
              Voir tout
            </router-link>
          </div>
          <div class="p-4">
            <recent-orders-table :orders="recentOrders" />
          </div>
        </div>

        <!-- Alertes et notifications -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-semibold">Alertes système</h2>
            <button @click="markAllAlertsRead" class="text-primary-600 hover:text-primary-700">
              Tout marquer comme lu
            </button>
          </div>
          <div class="p-4">
            <system-alerts :alerts="systemAlerts" @resolve="resolveAlert" />
          </div>
        </div>
      </div>

      <!-- Graphiques et analyses -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique des ventes -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Évolution des ventes</h2>
          </div>
          <div class="p-4">
            <sales-chart :data="salesData" />
          </div>
        </div>

        <!-- Top restaurants -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Top Restaurants</h2>
          </div>
          <div class="p-4">
            <top-restaurants-list :restaurants="topRestaurants" />
          </div>
        </div>
      </div>
    </main>

    <!-- Menu latéral de navigation -->
    <nav class="admin-nav fixed left-0 top-0 bottom-0 w-64 bg-gray-800 text-white">
      <div class="p-4">
        <h2 class="text-xl font-bold mb-8">Administration</h2>
        <ul class="space-y-2">
          <li>
            <router-link 
              to="/admin/dashboard" 
              class="nav-link"
              active-class="active"
            >
              <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/restaurants" 
              class="nav-link"
              active-class="active"
            >
              <i class="fas fa-store mr-2"></i>Restaurants
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/users" 
              class="nav-link"
              active-class="active"
            >
              <i class="fas fa-users mr-2"></i>Utilisateurs
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/orders" 
              class="nav-link"
              active-class="active"
            >
              <i class="fas fa-shopping-cart mr-2"></i>Commandes
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/drivers" 
              class="nav-link"
              active-class="active"
            >
              <i class="fas fa-motorcycle mr-2"></i>Livreurs
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/settings" 
              class="nav-link"
              active-class="active"
            >
              <i class="fas fa-cog mr-2"></i>Paramètres
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import StatCard from '@/components/admin/StatCard.vue'
import RecentOrdersTable from '@/components/admin/RecentOrdersTable.vue'
import SystemAlerts from '@/components/admin/SystemAlerts.vue'
import SalesChart from '@/components/admin/SalesChart.vue'
import TopRestaurantsList from '@/components/admin/TopRestaurantsList.vue'

const adminStore = useAdminStore()
const stats = ref({
  todayOrders: 0,
  revenue: 0,
  newUsers: 0,
  activeRestaurants: 0,
  ordersTrend: '+0%',
  revenueTrend: '+0%',
  usersTrend: '+0%',
  restaurantsTrend: '+0%'
})
const recentOrders = ref([])
const systemAlerts = ref([])
const salesData = ref([])
const topRestaurants = ref([])

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const markAllAlertsRead = async () => {
  try {
    await adminStore.markAllAlertsRead()
    loadSystemAlerts()
  } catch (error) {
    console.error('Erreur lors du marquage des alertes:', error)
  }
}

const resolveAlert = async (alertId) => {
  try {
    await adminStore.resolveAlert(alertId)
    loadSystemAlerts()
  } catch (error) {
    console.error('Erreur lors de la résolution de l\'alerte:', error)
  }
}

const loadDashboardData = async () => {
  try {
    stats.value = await adminStore.getDashboardStats()
    recentOrders.value = await adminStore.getRecentOrders()
    salesData.value = await adminStore.getSalesData()
    topRestaurants.value = await adminStore.getTopRestaurants()
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

const loadSystemAlerts = async () => {
  try {
    systemAlerts.value = await adminStore.getSystemAlerts()
  } catch (error) {
    console.error('Erreur lors du chargement des alertes:', error)
  }
}

onMounted(() => {
  loadDashboardData()
  loadSystemAlerts()
})
</script>

<style lang="scss" scoped>
.admin-nav {
  .nav-link {
    @apply flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg;
    
    &.active {
      @apply bg-gray-900 text-white;
    }
  }
}
</style>
