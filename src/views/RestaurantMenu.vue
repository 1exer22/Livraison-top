<template>
  <div class="min-h-screen bg-gray-100 pb-24">
    <!-- Image bannière -->
    <div class="relative h-64 w-full">
      <img
        v-if="restaurant?.image"
        :src="restaurant.image"
        :alt="restaurant?.name"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>
      <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-4xl font-bold">{{ restaurant?.name }}</h1>
          <p class="mt-2 text-lg">{{ restaurant?.description }}</p>
          <div class="mt-4 flex items-center space-x-4">
            <div class="flex items-center">
              <template v-for="n in 5" :key="n">
                <svg
                  :class="[
                    'h-5 w-5',
                    n <= (restaurant?.rating || 0)
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
              <span class="ml-2"> {{ restaurant?.rating }}/5 </span>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                restaurant?.isOpen
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ restaurant?.isOpen ? "Ouvert" : "Fermé" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Informations du restaurant -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center text-gray-600">
          <svg
            class="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{{ restaurant?.address }}</span>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600">Chargement du menu...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <!-- Menu items -->
        <div v-else>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Notre Menu</h2>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in menuItems"
              :key="item.id"
              class="bg-white rounded-lg shadow overflow-hidden"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <div class="flex justify-between items-start">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ item.name }}
                  </h3>
                  <span class="text-lg font-medium text-gray-900">{{
                    formatPrice(item.price)
                  }}</span>
                </div>
                <p class="mt-2 text-sm text-gray-500">{{ item.description }}</p>
                <div class="mt-4">
                  <button
                    @click="addToCart(item)"
                    :disabled="!item.available || !restaurant?.isOpen"
                    class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ getButtonText(item) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="menuItems.length === 0" class="text-center py-12">
            <p class="text-gray-500">Aucun plat disponible pour le moment.</p>
          </div>
        </div>
      </div>
    </main>

    <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div>
            <span class="text-gray-500"
              >{{ cartStore.items.length }} articles</span
            >
            <p class="text-lg font-medium text-gray-900">
              Total: {{ formatPrice(cartStore.total) }}
            </p>
          </div>
          <button
            @click="showDeliveryInfo = true"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            :disabled="cartStore.isEmpty"
          >
            Commander
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de commande -->
    <div
      v-if="showDeliveryInfo"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="showDeliveryInfo = false"
        ></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informations de livraison
            </h3>

            <div class="space-y-4">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                  >Nom</label
                >
                <input
                  type="text"
                  id="name"
                  v-model="deliveryInfo.name"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700"
                  >Téléphone</label
                >
                <input
                  type="tel"
                  id="phone"
                  v-model="deliveryInfo.phone"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  for="address"
                  class="block text-sm font-medium text-gray-700"
                  >Adresse</label
                >
                <textarea
                  id="address"
                  v-model="deliveryInfo.address"
                  rows="2"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                ></textarea>
              </div>

              <div>
                <label
                  for="instructions"
                  class="block text-sm font-medium text-gray-700"
                  >Instructions (optionnel)</label
                >
                <textarea
                  id="instructions"
                  v-model="deliveryInfo.instructions"
                  rows="2"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Code d'entrée, étage, etc."
                ></textarea>
              </div>
            </div>
          </div>

          <div
            class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"
          >
            <button
              type="button"
              @click="handleOrder"
              :disabled="loading || !isDeliveryInfoValid"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
            >
              {{ loading ? "Commande en cours..." : "Confirmer la commande" }}
            </button>
            <button
              type="button"
              @click="showDeliveryInfo = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRestaurantStore } from "../stores/restaurant";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { MenuItem, Restaurant } from "../stores/restaurant";

const route = useRoute();
const router = useRouter();
const restaurantStore = useRestaurantStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref<string | null>(null);
const restaurant = ref<Restaurant | null>(null);
const menuItems = ref<MenuItem[]>([]);
const showDeliveryInfo = ref(false);

const deliveryInfo = ref({
  name: "",
  phone: "",
  address: "",
  instructions: "",
});

const isDeliveryInfoValid = computed(() => {
  return (
    deliveryInfo.value.name &&
    deliveryInfo.value.phone &&
    deliveryInfo.value.address
  );
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const getButtonText = (item: MenuItem) => {
  if (!restaurant.value?.isOpen) return "Restaurant fermé";
  if (!item.available) return "Non disponible";
  return "Ajouter au panier";
};

const addToCart = (item: MenuItem) => {
  try {
    cartStore.addItem(item);
  } catch (error: any) {
    alert(error.message);
  }
};

const handleOrder = async () => {
  if (!authStore.user || !isDeliveryInfoValid.value) return;

  loading.value = true;
  try {
    await restaurantStore.createOrder({
      items: cartStore.items,
      total: cartStore.total,
      restaurantId: cartStore.restaurantId!,
      customerId: authStore.user.uid,
      customerName: deliveryInfo.value.name,
      customerAddress: deliveryInfo.value.address,
      deliveryNotes: deliveryInfo.value.instructions,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000), // +45 minutes
      preparationTime: 30, // 30 minutes
    });

    // Sauvegarder les informations de livraison dans le profil client
    await setDoc(
      doc(db, "clientProfiles", authStore.user.uid),
      {
        name: deliveryInfo.value.name,
        phone: deliveryInfo.value.phone,
        address: deliveryInfo.value.address,
        deliveryInstructions: deliveryInfo.value.instructions,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    cartStore.clear();
    router.push("/orders");
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const restaurantId = route.params.id as string;

  try {
    const restaurantData = await restaurantStore.fetchRestaurantById(
      restaurantId
    );
    if (!restaurantData) {
      error.value = "Restaurant non trouvé";
      return;
    }
    restaurant.value = restaurantData;

    const items = await restaurantStore.fetchMenuItemsByRestaurant(
      restaurantId
    );
    menuItems.value = items;

    // Charger les informations du profil client si connecté
    if (authStore.user) {
      const profileDoc = await getDoc(
        doc(db, "clientProfiles", authStore.user.uid)
      );
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        deliveryInfo.value = {
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          instructions: data.deliveryInstructions || "",
        };
      }
    }
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>
