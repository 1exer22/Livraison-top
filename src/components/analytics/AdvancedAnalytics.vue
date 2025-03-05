<template>
  <div class="advanced-analytics">
    <!-- Filtres et contrôles -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-4 gap-4">
        <div class="form-group">
          <label>Période</label>
          <select v-model="filters.period" class="form-select">
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        <div class="form-group">
          <label>Type d'analyse</label>
          <select v-model="filters.type" class="form-select">
            <option value="orders">Commandes</option>
            <option value="users">Utilisateurs</option>
            <option value="restaurants">Restaurants</option>
            <option value="revenue">Revenus</option>
          </select>
        </div>

        <div class="form-group">
          <label>Granularité</label>
          <select v-model="filters.granularity" class="form-select">
            <option value="hour">Par heure</option>
            <option value="day">Par jour</option>
            <option value="week">Par semaine</option>
            <option value="month">Par mois</option>
          </select>
        </div>

        <div class="form-group">
          <label>&nbsp;</label>
          <button @click="updateAnalytics" class="btn-primary w-full">
            Mettre à jour
          </button>
        </div>
      </div>
    </div>

    <!-- Insights principaux -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <insight-card
        v-for="insight in insights"
        :key="insight.id"
        :insight="insight"
      />
    </div>

    <!-- Graphiques avancés -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Tendances -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Tendances</h3>
          <div class="flex gap-2">
            <button 
              v-for="metric in availableMetrics"
              :key="metric.value"
              @click="selectedMetric = metric.value"
              :class="[
                'px-3 py-1 rounded-full text-sm',
                selectedMetric === metric.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700'
              ]"
            >
              {{ metric.label }}
            </button>
          </div>
        </div>
        <trend-chart
          :data="trendData"
          :metric="selectedMetric"
        />
      </div>

      <!-- Prédictions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Prédictions</h3>
          <select v-model="predictionPeriod" class="form-select">
            <option value="day">24 heures</option>
            <option value="week">7 jours</option>
            <option value="month">30 jours</option>
          </select>
        </div>
        <prediction-chart
          :data="predictionData"
          :period="predictionPeriod"
        />
      </div>
    </div>

    <!-- Analyses comportementales -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Parcours utilisateur -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Parcours utilisateur</h3>
        <user-journey-chart :data="userJourneyData" />
      </div>

      <!-- Rétention -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Rétention</h3>
        <retention-chart :data="retentionData" />
      </div>

      <!-- Segments -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Segments utilisateurs</h3>
        <segment-chart :data="segmentData" />
      </div>
    </div>

    <!-- Rapports détaillés -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Rapports détaillés</h3>
          <button @click="exportReport" class="btn-secondary">
            <i class="fas fa-download mr-2"></i>Exporter
          </button>
        </div>
      </div>
      <div class="p-4">
        <data-table
          :columns="reportColumns"
          :data="reportData"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import InsightCard from './InsightCard.vue'
import TrendChart from './TrendChart.vue'
import PredictionChart from './PredictionChart.vue'
import UserJourneyChart from './UserJourneyChart.vue'
import RetentionChart from './RetentionChart.vue'
import SegmentChart from './SegmentChart.vue'
import DataTable from '@/components/common/DataTable.vue'

const analyticsStore = useAnalyticsStore()

// États
const filters = ref({
  period: 'month',
  type: 'orders',
  granularity: 'day'
})

const selectedMetric = ref('orders')
const predictionPeriod = ref('week')
const loading = ref(false)

// Métriques disponibles
const availableMetrics = [
  { label: 'Commandes', value: 'orders' },
  { label: 'Revenus', value: 'revenue' },
  { label: 'Utilisateurs', value: 'users' }
]

// Données
const insights = ref([])
const trendData = ref([])
const predictionData = ref([])
const userJourneyData = ref([])
const retentionData = ref([])
const segmentData = ref([])
const reportData = ref([])

// Colonnes du rapport
const reportColumns = computed(() => {
  const columns = {
    orders: [
      { key: 'date', label: 'Date' },
      { key: 'count', label: 'Nombre de commandes' },
      { key: 'revenue', label: 'Chiffre d\'affaires' },
      { key: 'avgOrderValue', label: 'Panier moyen' },
      { key: 'completionRate', label: 'Taux de complétion' }
    ],
    users: [
      { key: 'date', label: 'Date' },
      { key: 'newUsers', label: 'Nouveaux utilisateurs' },
      { key: 'activeUsers', label: 'Utilisateurs actifs' },
      { key: 'orderRate', label: 'Taux de conversion' },
      { key: 'retention', label: 'Rétention' }
    ],
    restaurants: [
      { key: 'date', label: 'Date' },
      { key: 'activeRestaurants', label: 'Restaurants actifs' },
      { key: 'avgOrdersPerRestaurant', label: 'Commandes moyennes' },
      { key: 'avgRevenuePerRestaurant', label: 'Revenu moyen' },
      { key: 'satisfaction', label: 'Satisfaction' }
    ],
    revenue: [
      { key: 'date', label: 'Date' },
      { key: 'grossRevenue', label: 'Revenu brut' },
      { key: 'netRevenue', label: 'Revenu net' },
      { key: 'commission', label: 'Commissions' },
      { key: 'deliveryFees', label: 'Frais de livraison' }
    ]
  }
  return columns[filters.value.type]
})

// Méthodes
const updateAnalytics = async () => {
  try {
    loading.value = true
    
    // Charger les insights
    const insightsData = await analyticsStore.fetchInsights(filters.value)
    insights.value = insightsData.insights
    
    // Charger les tendances
    const trendsData = await analyticsStore.analyzeTrends({
      ...filters.value,
      metric: selectedMetric.value
    })
    trendData.value = trendsData
    
    // Charger les prédictions
    const predictionsData = await analyticsStore.fetchPredictions({
      ...filters.value,
      period: predictionPeriod.value
    })
    predictionData.value = predictionsData
    
    // Mettre à jour les autres visualisations
    await loadBehavioralAnalytics()
    await loadDetailedReport()
  } catch (error) {
    console.error('Erreur de mise à jour des analytics:', error)
  } finally {
    loading.value = false
  }
}

const loadBehavioralAnalytics = async () => {
  try {
    const response = await fetch('/api/analytics/behavioral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filters.value)
    })
    const data = await response.json()
    
    userJourneyData.value = data.userJourney
    retentionData.value = data.retention
    segmentData.value = data.segments
  } catch (error) {
    console.error('Erreur de chargement des analyses comportementales:', error)
  }
}

const loadDetailedReport = async () => {
  try {
    const response = await fetch('/api/analytics/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filters.value)
    })
    reportData.value = await response.json()
  } catch (error) {
    console.error('Erreur de chargement du rapport:', error)
  }
}

const exportReport = async () => {
  try {
    const response = await fetch('/api/analytics/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filters.value,
        data: reportData.value
      })
    })
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${filters.value.type}-${filters.value.period}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur d\'export du rapport:', error)
  }
}

// Surveillance des changements
watch([filters, selectedMetric, predictionPeriod], () => {
  updateAnalytics()
})

// Chargement initial
onMounted(() => {
  updateAnalytics()
})
</script>

<style lang="scss" scoped>
.form-select {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 
         flex items-center justify-center transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
         flex items-center transition-colors duration-200;
}
</style>
