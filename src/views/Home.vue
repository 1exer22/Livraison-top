<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Food Delivery</h1>
        <div class="flex items-center space-x-4">
          <template v-if="!authStore.user">
            <router-link
              to="/login"
              class="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Connexion
            </router-link>
            <router-link
              to="/register"
              class="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Inscription
            </router-link>
          </template>
          <template v-else>
            <span class="text-sm text-gray-500">
              {{ authStore.userProfile?.email }}
            </span>
            <button
              @click="authStore.signOut"
              class="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Déconnexion
            </button>
          </template>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="text-center">
          <h2
            class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
          >
            <span class="block">Vos restaurants préférés</span>
            <span class="block text-indigo-600">livrés chez vous</span>
          </h2>
          <p
            class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Découvrez les meilleurs restaurants de votre quartier et faites-vous
            livrer en quelques clics.
          </p>
        </div>

        <!-- Section Restaurants -->
        <div class="mt-12">
          <div v-if="loading" class="text-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
            ></div>
            <p class="mt-4 text-gray-600">Chargement des restaurants...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
          </div>

          <div v-else class="grid gap-6 lg:grid-cols-3">
            <div
              v-for="restaurant in openRestaurants"
              :key="restaurant.id"
              class="flex flex-col rounded-lg shadow-lg overflow-hidden"
            >
              <div class="flex-shrink-0">
                <img
                  class="h-48 w-full object-cover"
                  :src="restaurant.image"
                  :alt="restaurant.name"
                />
              </div>
              <div class="flex-1 bg-white p-6 flex flex-col justify-between">
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-xl font-semibold text-gray-900">
                      {{ restaurant.name }}
                    </p>
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        restaurant.isOpen
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      ]"
                    >
                      {{ restaurant.isOpen ? "Ouvert" : "Fermé" }}
                    </span>
                  </div>
                  <div class="mt-3 flex items-center">
                    <div class="flex items-center">
                      <template v-for="n in 5" :key="n">
                        <svg
                          :class="[
                            'h-5 w-5',
                            n <= restaurant.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300',
                          ]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </template>
                      <span class="ml-2 text-sm text-gray-500">
                        {{ restaurant.rating }}/5
                      </span>
                    </div>
                  </div>
                  <p class="mt-3 text-base text-gray-500">
                    {{ restaurant.description }}
                  </p>
                  <p class="mt-2 text-sm text-gray-500">
                    {{ restaurant.address }}
                  </p>
                </div>
                <div class="mt-6">
                  <router-link
                    :to="{
                      name: 'restaurant-menu',
                      params: { id: restaurant.id },
                    }"
                    class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    :class="{
                      'opacity-50 cursor-not-allowed': !restaurant.isOpen,
                    }"
                    :disabled="!restaurant.isOpen"
                  >
                    {{
                      restaurant.isOpen ? "Voir le menu" : "Restaurant fermé"
                    }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <div v-if="openRestaurants.length === 0" class="text-center py-12">
            <p class="text-gray-500">
              Aucun restaurant disponible pour le moment.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useRestaurantStore } from "../stores/restaurant";
import type { Restaurant } from "../stores/restaurant";

const router = useRouter();
const authStore = useAuthStore();
const restaurantStore = useRestaurantStore();

const loading = ref(false);
const error = ref<string | null>(null);

const openRestaurants = computed(() => {
  return restaurantStore.restaurants;
});

onMounted(async () => {
  loading.value = true;
  try {
    await restaurantStore.fetchRestaurants();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>
