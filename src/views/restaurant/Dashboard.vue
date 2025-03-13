<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Restaurant</h1>
        <button
          @click="authStore.signOut"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Déconnexion
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Navigation par onglets -->
      <div class="mb-6">
        <nav class="flex space-x-4" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="[
              currentTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700',
              'px-3 py-2 font-medium text-sm rounded-md',
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div v-if="currentTab === 'orders'">
        <OrdersManagement />
      </div>

      <div v-if="currentTab === 'menu'">
        <MenuManagement />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRestaurantStore } from "../../stores/restaurant";
import OrdersManagement from "../../components/restaurant/OrdersManagement.vue";
import MenuManagement from "../../components/restaurant/MenuManagement.vue";

const authStore = useAuthStore();
const restaurantStore = useRestaurantStore();

const tabs = [
  { id: "orders", name: "Commandes" },
  { id: "menu", name: "Menu" },
] as const;

const currentTab = ref<(typeof tabs)[number]["id"]>("orders");

onMounted(async () => {
  await restaurantStore.fetchMenuItems();
  restaurantStore.startOrdersListener();
});
</script>
