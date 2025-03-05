<template>
  <div class="client-dashboard">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Bonjour, {{ user?.firstName }}
        </h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Commandes récentes -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Commandes récentes</h2>
          <router-link
            to="/orders"
            class="text-primary-600 hover:text-primary-700"
          >
            Voir tout
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <order-card
            v-for="order in recentOrders"
            :key="order.id"
            :order="order"
          />
        </div>
      </div>

      <!-- Restaurants favoris -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Vos restaurants favoris</h2>
          <router-link
            to="/restaurants"
            class="text-primary-600 hover:text-primary-700"
          >
            Explorer plus
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <restaurant-card
            v-for="restaurant in favoriteRestaurants"
            :key="restaurant.id"
            :restaurant="restaurant"
          />
        </div>
      </div>

      <!-- Offres et promotions -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Offres spéciales</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="offer in specialOffers"
            :key="offer.id"
            class="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <img
              :src="offer.image"
              :alt="offer.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="text-lg font-medium mb-2">{{ offer.title }}</h3>
              <p class="text-gray-600 mb-4">{{ offer.description }}</p>
              <div class="flex justify-between items-center">
                <span class="text-primary-600 font-medium">
                  {{ offer.discount }}
                </span>
                <button @click="useOffer(offer)" class="btn-primary">
                  En profiter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Points de fidélité -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Programme de fidélité</h2>
          <span class="text-2xl font-bold text-primary-600">
            {{ loyaltyPoints }} points
          </span>
        </div>
        <div class="relative pt-1">
          <div class="flex mb-2 items-center justify-between">
            <div>
              <span
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200"
              >
                Progression
              </span>
            </div>
            <div class="text-right">
              <span class="text-xs font-semibold inline-block text-primary-600">
                {{ progressToNextReward }}%
              </span>
            </div>
          </div>
          <div
            class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200"
          >
            <div
              :style="{ width: `${progressToNextReward}%` }"
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
            ></div>
          </div>
          <p class="text-sm text-gray-600">
            Plus que {{ pointsToNextReward }} points pour votre prochaine
            récompense !
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useOrderStore } from "@/stores/order";
import { useRestaurantStore } from "@/stores/restaurant";
import OrderCard from "@/components/order/OrderCard.vue";
import RestaurantCard from "@/components/restaurant/RestaurantCard.vue";

const authStore = useAuthStore();
const orderStore = useOrderStore();
const restaurantStore = useRestaurantStore();

const user = ref(null);
const recentOrders = ref([]);
const favoriteRestaurants = ref([]);
const specialOffers = ref([]);
const loyaltyPoints = ref(0);
const pointsToNextReward = ref(100);
const progressToNextReward = ref(0);

const loadDashboardData = async () => {
  try {
    // Charger les données de l'utilisateur
    user.value = authStore.user;

    // Charger les commandes récentes
    recentOrders.value = await orderStore.getRecentOrders(user.value.id);

    // Charger les restaurants favoris
    favoriteRestaurants.value = await restaurantStore.getFavoriteRestaurants(
      user.value.id
    );

    // Charger les offres spéciales
    specialOffers.value = await restaurantStore.getSpecialOffers();

    // Charger les points de fidélité
    const loyalty = await authStore.getLoyaltyInfo(user.value.id);
    loyaltyPoints.value = loyalty.points;
    pointsToNextReward.value = loyalty.pointsToNextReward;
    progressToNextReward.value = loyaltyPoints.value % 100;
  } catch (error) {
    console.error("Erreur de chargement des données:", error);
  }
};

const useOffer = async (offer) => {
  try {
    await orderStore.applyOffer(offer.id);
    // Rediriger vers le restaurant ou la page de commande
  } catch (error) {
    console.error("Erreur lors de l'application de l'offre:", error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg
         hover:bg-primary-700 transition-colors duration-200;
}
</style>
