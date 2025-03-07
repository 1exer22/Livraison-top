<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Livreur</h1>
        <button
          @click="authStore.signOut"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Déconnexion
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Contenu à implémenter -->
        <div
          class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center"
        >
          <p class="text-gray-500">
            Dashboard Livreur - En cours de développement
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
</script>
