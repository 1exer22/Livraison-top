<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Gestion du Menu</h2>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Ajouter un plat
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="bg-white overflow-hidden shadow rounded-lg border"
      >
        <img
          :src="item.image"
          :alt="item.name"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-medium text-gray-900">{{ item.name }}</h3>
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                item.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ item.available ? "Disponible" : "Indisponible" }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500" :title="item.description">
            {{ truncateDescription(item.description) }}
          </p>
          <p class="mt-2 text-lg font-medium text-gray-900">
            {{ formatPrice(item.price) }}
          </p>
          <div class="mt-4 flex justify-between items-center">
            <button
              @click="editItem(item)"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Modifier
            </button>
            <button
              @click="toggleAvailability(item)"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md"
              :class="
                item.available
                  ? 'text-red-700 hover:bg-red-50'
                  : 'text-green-700 hover:bg-green-50'
              "
            >
              {{
                item.available ? "Marquer indisponible" : "Marquer disponible"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <MenuItemModal
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :item="editingItem"
      @close="closeModal"
      @save="saveItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRestaurantStore } from "../../stores/restaurant";
import type { MenuItem } from "../../stores/restaurant";
import MenuItemModal from "./MenuItemModal.vue";

const restaurantStore = useRestaurantStore();
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingItem = ref<MenuItem | null>(null);

const menuItems = computed(() => restaurantStore.menuItems);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const truncateDescription = (description: string) => {
  if (description.length <= 100) return description;
  return description.slice(0, 10) + "...";
};

const editItem = (item: MenuItem) => {
  editingItem.value = { ...item };
  showEditModal.value = true;
};

const toggleAvailability = async (item: MenuItem) => {
  if (item.id) {
    await restaurantStore.updateMenuItem(item.id, {
      available: !item.available,
    });
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingItem.value = null;
};

const saveItem = async (item: MenuItem, image?: File) => {
  try {
    if (editingItem.value?.id) {
      await restaurantStore.updateMenuItem(editingItem.value.id, item, image);
    } else {
      await restaurantStore.addMenuItem(item, image!);
    }
    closeModal();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
  }
};
</script>
