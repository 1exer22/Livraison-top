<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      <div class="flex items-center">
        <img
          :src="restaurant.image"
          :alt="restaurant.name"
          class="w-12 h-12 rounded-lg object-cover mr-4"
        />
        <div>
          <h3 class="text-lg font-medium">{{ restaurant.name }}</h3>
          <p class="text-sm text-gray-500">{{ restaurant.cuisineType }}</p>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Statistiques rapides -->
        <div class="grid grid-cols-3 gap-4">
          <div class="stat-box">
            <span class="stat-label">Note moyenne</span>
            <div class="stat-value flex items-center">
              <span class="text-yellow-400 mr-2">★</span>
              {{ restaurant.rating }}/5
            </div>
            <span class="stat-subtitle">{{ restaurant.reviewCount }} avis</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Commandes</span>
            <div class="stat-value">{{ restaurant.orderCount }}</div>
            <span class="stat-subtitle">ce mois</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Chiffre d'affaires</span>
            <div class="stat-value">{{ formatPrice(restaurant.revenue) }}</div>
            <span class="stat-subtitle">ce mois</span>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Colonne gauche -->
          <div class="space-y-4">
            <div class="info-group">
              <h4 class="info-title">Contact</h4>
              <div class="info-content">
                <p>
                  <i class="fas fa-envelope mr-2 text-gray-400"></i>
                  {{ restaurant.email }}
                </p>
                <p>
                  <i class="fas fa-phone mr-2 text-gray-400"></i>
                  {{ restaurant.phone }}
                </p>
                <p>
                  <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                  {{ restaurant.address }}
                </p>
              </div>
            </div>

            <div class="info-group">
              <h4 class="info-title">Paramètres de livraison</h4>
              <div class="info-content">
                <div class="flex justify-between">
                  <span>Frais de livraison</span>
                  <span>{{ formatPrice(restaurant.deliveryFee) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Commande minimum</span>
                  <span>{{ formatPrice(restaurant.minimumOrder) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Temps de préparation</span>
                  <span>{{ restaurant.prepTime }} min</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite -->
          <div class="space-y-4">
            <div class="info-group">
              <h4 class="info-title">Horaires d'ouverture</h4>
              <div class="info-content">
                <div
                  v-for="(hours, day) in restaurant.openingHours"
                  :key="day"
                  class="flex justify-between text-sm"
                >
                  <span>{{ day }}</span>
                  <span>{{
                    hours.closed ? "Fermé" : `${hours.open} - ${hours.close}`
                  }}</span>
                </div>
              </div>
            </div>

            <div class="info-group">
              <h4 class="info-title">Commission</h4>
              <div class="info-content">
                <div class="flex justify-between">
                  <span>Taux de commission</span>
                  <span>{{ restaurant.commission }}%</span>
                </div>
                <div class="flex justify-between">
                  <span>Commission ce mois</span>
                  <span>{{ formatPrice(restaurant.monthlyCommission) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique des performances -->
        <div class="performance-chart">
          <div class="flex justify-between items-center mb-4">
            <h4 class="info-title">Performance des ventes</h4>
            <select v-model="chartPeriod" class="form-select">
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
          <div class="h-64">
            <sales-chart :data="salesData" />
          </div>
        </div>

        <!-- Menu populaire -->
        <div class="popular-menu">
          <h4 class="info-title mb-4">Plats les plus vendus</h4>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="item in popularItems"
              :key="item.id"
              class="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-12 h-12 rounded object-cover"
              />
              <div class="ml-3 flex-grow">
                <h5 class="font-medium">{{ item.name }}</h5>
                <p class="text-sm text-gray-500">
                  {{ item.orderCount }} commandes
                </p>
              </div>
              <span class="font-medium">{{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>

        <!-- Derniers avis -->
        <div class="recent-reviews">
          <h4 class="info-title mb-4">Derniers avis</h4>
          <div class="space-y-4">
            <div
              v-for="review in recentReviews"
              :key="review.id"
              class="review-card"
            >
              <div class="flex items-start">
                <img
                  :src="review.user.avatar"
                  :alt="review.user.name"
                  class="w-10 h-10 rounded-full"
                />
                <div class="ml-3 flex-grow">
                  <div class="flex justify-between">
                    <h5 class="font-medium">{{ review.user.name }}</h5>
                    <div class="flex items-center">
                      <span class="text-yellow-400 mr-1">★</span>
                      {{ review.rating }}
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ review.comment }}</p>
                  <span class="text-xs text-gray-500">{{
                    formatDate(review.date)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <div class="flex space-x-2">
          <button
            @click="toggleStatus"
            :class="[
              'btn-outline',
              restaurant.active ? 'text-red-600' : 'text-green-600',
            ]"
          >
            {{ restaurant.active ? "Désactiver" : "Activer" }}
          </button>
          <button @click="$emit('edit', restaurant)" class="btn-outline">
            Modifier
          </button>
        </div>
        <button
          @click="$emit('update:modelValue', false)"
          class="btn-secondary"
        >
          Fermer
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, computed } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";
import SalesChart from "@/components/charts/SalesChart.vue";

const props = defineProps({
  modelValue: Boolean,
  restaurant: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "edit", "status-change"]);

const chartPeriod = ref("month");
const salesData = computed(
  () => props.restaurant.salesData?.[chartPeriod.value] || []
);
const popularItems = computed(() => props.restaurant.popularItems || []);
const recentReviews = computed(() => props.restaurant.recentReviews || []);

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toggleStatus = () => {
  emit("status-change", !props.restaurant.active);
};
</script>

<style lang="scss" scoped>
.stat-box {
  @apply bg-gray-50 rounded-lg p-4 text-center;

  .stat-label {
    @apply text-sm text-gray-600;
  }

  .stat-value {
    @apply text-2xl font-semibold mt-1;
  }

  .stat-subtitle {
    @apply text-xs text-gray-500 mt-1;
  }
}

.info-group {
  @apply bg-gray-50 rounded-lg p-4;

  .info-title {
    @apply text-sm font-medium text-gray-700 mb-3;
  }

  .info-content {
    @apply space-y-2;
  }
}

.form-select {
  @apply px-3 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.review-card {
  @apply bg-gray-50 rounded-lg p-4;
}

.btn-outline {
  @apply px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}
</style>
