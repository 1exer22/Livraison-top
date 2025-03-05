<template>
  <div class="order-management">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
          <div class="flex gap-4">
            <select v-model="filterStatus" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptée</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="delivered">Livrée</option>
            </select>
            <button @click="refreshOrders" class="btn-secondary">
              <i class="fas fa-sync-alt mr-2"></i>Actualiser
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Tableaux des commandes par statut -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Commandes en attente et acceptées -->
        <div class="col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-4 border-b">
              <h2 class="text-lg font-semibold">Commandes actives</h2>
            </div>
            <div class="p-4">
              <div class="space-y-4">
                <order-card
                  v-for="order in activeOrders"
                  :key="order.id"
                  :order="order"
                  :expanded="true"
                  @status-change="updateOrderStatus"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications et statistiques -->
        <div class="space-y-6">
          <!-- Statistiques rapides -->
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Aujourd'hui</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="stat-box">
                <span class="text-sm text-gray-600">Commandes</span>
                <span class="text-2xl font-bold">{{ todayStats.orderCount }}</span>
              </div>
              <div class="stat-box">
                <span class="text-sm text-gray-600">Chiffre d'affaires</span>
                <span class="text-2xl font-bold">{{ formatPrice(todayStats.revenue) }}</span>
              </div>
              <div class="stat-box">
                <span class="text-sm text-gray-600">Temps moyen</span>
                <span class="text-2xl font-bold">{{ todayStats.avgPrepTime }}min</span>
              </div>
              <div class="stat-box">
                <span class="text-sm text-gray-600">En attente</span>
                <span class="text-2xl font-bold">{{ pendingOrders.length }}</span>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Notifications</h2>
            <div class="space-y-2">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
              >
                <div class="flex items-center gap-2">
                  <i :class="getNotificationIcon(notification.type)"></i>
                  <span>{{ notification.message }}</span>
                </div>
                <span class="text-sm text-gray-500">
                  {{ formatTime(notification.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique des commandes -->
      <div class="mt-8">
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Historique des commandes</h2>
          </div>
          <div class="p-4">
            <table class="min-w-full">
              <thead>
                <tr>
                  <th class="text-left">N° Commande</th>
                  <th class="text-left">Date</th>
                  <th class="text-left">Client</th>
                  <th class="text-right">Montant</th>
                  <th class="text-center">Statut</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orderHistory" :key="order.id" class="border-t">
                  <td class="py-3">#{{ order.number }}</td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                  <td>{{ order.customer.name }}</td>
                  <td class="text-right">{{ formatPrice(order.total) }}</td>
                  <td class="text-center">
                    <status-badge :status="order.status" />
                  </td>
                  <td class="text-center">
                    <button 
                      @click="showOrderDetails(order)"
                      class="text-primary-500 hover:text-primary-600"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal détails commande -->
    <order-details-modal
      v-if="selectedOrder"
      :show="!!selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRestaurantStore } from '@/stores/restaurant'
import OrderCard from '@/components/restaurant/OrderCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import OrderDetailsModal from '@/components/restaurant/OrderDetailsModal.vue'

const restaurantStore = useRestaurantStore()
const filterStatus = ref('')
const selectedOrder = ref(null)
const notifications = ref([])
const todayStats = ref({
  orderCount: 0,
  revenue: 0,
  avgPrepTime: 0
})

const activeOrders = computed(() => {
  return restaurantStore.orders.filter(order => 
    ['pending', 'accepted', 'preparing'].includes(order.status)
  )
})

const pendingOrders = computed(() => {
  return activeOrders.value.filter(order => order.status === 'pending')
})

const orderHistory = computed(() => {
  return restaurantStore.orders.filter(order =>
    filterStatus.value ? order.status === filterStatus.value : true
  ).slice(0, 50) // Limiter à 50 commandes
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getNotificationIcon = (type) => {
  const icons = {
    new_order: 'fas fa-shopping-bag text-primary-500',
    order_ready: 'fas fa-check text-green-500',
    order_delayed: 'fas fa-clock text-yellow-500',
    order_issue: 'fas fa-exclamation-triangle text-red-500'
  }
  return icons[type] || 'fas fa-bell'
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await restaurantStore.updateOrderStatus(orderId, newStatus)
    refreshOrders()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  }
}

const showOrderDetails = (order) => {
  selectedOrder.value = order
}

const refreshOrders = async () => {
  await restaurantStore.fetchOrders()
  await loadTodayStats()
}

const loadTodayStats = async () => {
  todayStats.value = await restaurantStore.getTodayStats()
}

// Souscription aux mises à jour en temps réel
let unsubscribe
onMounted(async () => {
  await refreshOrders()
  unsubscribe = restaurantStore.subscribeToOrders((newOrder) => {
    notifications.value.unshift({
      id: Date.now(),
      type: 'new_order',
      message: `Nouvelle commande #${newOrder.number}`,
      timestamp: new Date()
    })
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style lang="scss" scoped>
.stat-box {
  @apply flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg;
}

.notification-item {
  @apply flex justify-between items-center p-3 bg-gray-50 rounded-lg;
}

.form-select {
  @apply px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
         flex items-center transition-colors duration-200;
}
</style>
