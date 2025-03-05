<template>
  <div class="driver-dashboard">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard Livreur</h1>
          <div class="flex items-center gap-4">
            <status-toggle
              v-model="isAvailable"
              @change="updateAvailability"
              :loading="updatingStatus"
            />
            <span :class="['status-badge', isAvailable ? 'active' : 'inactive']">
              {{ isAvailable ? 'En ligne' : 'Hors ligne' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Carte et livraisons -->
        <div class="lg:col-span-2">
          <!-- Carte de livraison -->
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="p-4 border-b">
              <h2 class="text-lg font-semibold">Zone de livraison</h2>
            </div>
            <div class="h-[400px]" ref="mapContainer"></div>
          </div>

          <!-- Livraisons disponibles -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-4 border-b">
              <h2 class="text-lg font-semibold">Livraisons disponibles</h2>
            </div>
            <div class="p-4">
              <div class="space-y-4">
                <delivery-card
                  v-for="delivery in availableDeliveries"
                  :key="delivery.id"
                  :delivery="delivery"
                  @accept="acceptDelivery"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques et livraison en cours -->
        <div class="space-y-6">
          <!-- Statistiques journalières -->
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Aujourd'hui</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="stat-box">
                <span class="text-sm text-gray-600">Livraisons</span>
                <span class="text-2xl font-bold">{{ todayStats.deliveryCount }}</span>
              </div>
              <div class="stat-box">
                <span class="text-sm text-gray-600">Gains</span>
                <span class="text-2xl font-bold">{{ formatPrice(todayStats.earnings) }}</span>
              </div>
              <div class="stat-box">
                <span class="text-sm text-gray-600">Distance</span>
                <span class="text-2xl font-bold">{{ todayStats.totalDistance }}km</span>
              </div>
              <div class="stat-box">
                <span class="text-sm text-gray-600">Temps actif</span>
                <span class="text-2xl font-bold">{{ formatDuration(todayStats.activeTime) }}</span>
              </div>
            </div>
          </div>

          <!-- Livraison en cours -->
          <div v-if="currentDelivery" class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Livraison en cours</h2>
            <current-delivery
              :delivery="currentDelivery"
              @complete="completeDelivery"
              @update-status="updateDeliveryStatus"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDriverStore } from '@/stores/driver'
import StatusToggle from '@/components/driver/StatusToggle.vue'
import DeliveryCard from '@/components/driver/DeliveryCard.vue'
import CurrentDelivery from '@/components/driver/CurrentDelivery.vue'
import { initMap, updateDriverLocation } from '@/services/mapService'

const driverStore = useDriverStore()
const mapContainer = ref(null)
const isAvailable = ref(false)
const updatingStatus = ref(false)
const currentDelivery = ref(null)
const availableDeliveries = ref([])
const todayStats = ref({
  deliveryCount: 0,
  earnings: 0,
  totalDistance: 0,
  activeTime: 0
})

let map
let locationWatcher

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins.toString().padStart(2, '0')}`
}

const updateAvailability = async (status) => {
  updatingStatus.value = true
  try {
    await driverStore.updateAvailability(status)
    isAvailable.value = status
    if (status) {
      startLocationTracking()
    } else {
      stopLocationTracking()
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  } finally {
    updatingStatus.value = false
  }
}

const startLocationTracking = () => {
  if ('geolocation' in navigator) {
    locationWatcher = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords
        updateDriverLocation(map, { lat: latitude, lng: longitude })
        driverStore.updateLocation({ latitude, longitude })
      },
      error => console.error('Erreur de géolocalisation:', error),
      { enableHighAccuracy: true }
    )
  }
}

const stopLocationTracking = () => {
  if (locationWatcher) {
    navigator.geolocation.clearWatch(locationWatcher)
  }
}

const acceptDelivery = async (delivery) => {
  try {
    await driverStore.acceptDelivery(delivery.id)
    currentDelivery.value = delivery
    loadAvailableDeliveries()
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de la livraison:', error)
  }
}

const completeDelivery = async () => {
  try {
    await driverStore.completeDelivery(currentDelivery.value.id)
    currentDelivery.value = null
    loadTodayStats()
    loadAvailableDeliveries()
  } catch (error) {
    console.error('Erreur lors de la finalisation de la livraison:', error)
  }
}

const updateDeliveryStatus = async (status) => {
  try {
    await driverStore.updateDeliveryStatus(currentDelivery.value.id, status)
    currentDelivery.value = {
      ...currentDelivery.value,
      status
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de livraison:', error)
  }
}

const loadAvailableDeliveries = async () => {
  try {
    availableDeliveries.value = await driverStore.getAvailableDeliveries()
  } catch (error) {
    console.error('Erreur lors du chargement des livraisons:', error)
  }
}

const loadTodayStats = async () => {
  try {
    todayStats.value = await driverStore.getTodayStats()
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

onMounted(async () => {
  map = await initMap(mapContainer.value)
  const driverData = await driverStore.getDriverData()
  isAvailable.value = driverData.isAvailable
  if (isAvailable.value) {
    startLocationTracking()
  }
  loadTodayStats()
  loadAvailableDeliveries()
  currentDelivery.value = await driverStore.getCurrentDelivery()
})

onUnmounted(() => {
  stopLocationTracking()
})
</script>

<style lang="scss" scoped>
.status-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
  
  &.active {
    @apply bg-green-100 text-green-800;
  }
  
  &.inactive {
    @apply bg-gray-100 text-gray-800;
  }
}

.stat-box {
  @apply flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg;
}
</style>
