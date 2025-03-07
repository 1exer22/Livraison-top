<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Food Delivery</h1>
        <div class="flex items-center space-x-4">
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

        <!-- Section Restaurants (à implémenter) -->
        <div
          class="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none"
        >
          <div class="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div class="flex-shrink-0">
              <img
                class="h-48 w-full object-cover"
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Restaurant"
              />
            </div>
            <div class="flex-1 bg-white p-6 flex flex-col justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-indigo-600">
                  Restaurant Example
                </p>
                <div class="block mt-2">
                  <p class="text-xl font-semibold text-gray-900">
                    Découvrez nos délicieux plats
                  </p>
                  <p class="mt-3 text-base text-gray-500">
                    Une sélection de plats savoureux préparés avec soin par nos
                    chefs.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- Autres restaurants à ajouter dynamiquement -->
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
</script>
