<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero bg-primary-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              La livraison de repas à votre porte
            </h1>
            <p class="text-xl text-gray-600 mb-8">
              Découvrez les meilleurs restaurants de votre quartier et
              faites-vous livrer en quelques clics.
            </p>
            <div class="flex gap-4">
              <router-link to="/restaurants" class="btn-primary">
                Commander maintenant
              </router-link>
              <router-link to="/register" class="btn-secondary">
                Devenir partenaire
              </router-link>
            </div>
          </div>
          <div class="hidden md:block">
            <img
              src="@/assets/hero-image.png"
              alt="Food Delivery"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Comment ça marche -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <i class="fas fa-search text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Choisissez</h3>
            <p class="text-gray-600">
              Parcourez les menus de vos restaurants préférés
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <i class="fas fa-shopping-cart text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Commandez</h3>
            <p class="text-gray-600">
              Sélectionnez vos plats et payez en ligne
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <i class="fas fa-motorcycle text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Profitez</h3>
            <p class="text-gray-600">
              Faites-vous livrer rapidement à domicile
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Restaurants populaires -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold">Restaurants populaires</h2>
          <router-link
            to="/restaurants"
            class="text-primary-600 hover:text-primary-700"
          >
            Voir tout <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <restaurant-card
            v-for="restaurant in popularRestaurants"
            :key="restaurant.id"
            :restaurant="restaurant"
          />
        </div>
      </div>
    </section>

    <!-- Téléchargement application -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-primary-600 rounded-2xl p-8 md:p-12">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 class="text-3xl font-bold text-white mb-4">
                Téléchargez notre application
              </h2>
              <p class="text-primary-100 mb-8">
                Commandez encore plus facilement avec notre application mobile.
                Profitez d'offres exclusives et suivez vos commandes en temps
                réel.
              </p>
              <div class="flex gap-4">
                <a href="#" class="btn-white">
                  <i class="fab fa-apple mr-2"></i>App Store
                </a>
                <a href="#" class="btn-white">
                  <i class="fab fa-google-play mr-2"></i>Play Store
                </a>
              </div>
            </div>
            <div class="hidden md:block">
              <img
                src="@/assets/app-preview.png"
                alt="Mobile App"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import RestaurantCard from "@/components/restaurant/RestaurantCard.vue";
import { useRestaurantStore } from "@/stores/restaurant";

const restaurantStore = useRestaurantStore();
const popularRestaurants = ref([]);

onMounted(async () => {
  popularRestaurants.value = await restaurantStore.getPopularRestaurants();
});
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply inline-flex items-center px-6 py-3 border border-transparent text-base 
         font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 
         transition-colors duration-200;
}

.btn-secondary {
  @apply inline-flex items-center px-6 py-3 border border-primary-600 text-base 
         font-medium rounded-md text-primary-600 hover:bg-primary-50 
         transition-colors duration-200;
}

.btn-white {
  @apply inline-flex items-center px-6 py-3 border border-white text-base 
         font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 
         transition-colors duration-200;
}
</style>
