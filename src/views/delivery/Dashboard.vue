<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Livreur</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <span class="mr-2 text-sm text-gray-500">Disponibilité</span>
            <button
              @click="toggleAvailability"
              :class="[
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                isAvailable ? 'bg-indigo-600' : 'bg-gray-200',
              ]"
              role="switch"
              :aria-checked="isAvailable"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                  isAvailable ? 'translate-x-5' : 'translate-x-0',
                ]"
              />
            </button>
          </div>
          <button
            @click="authStore.signOut"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
          <!-- Statistiques -->
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Vos statistiques
            </h2>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total des livraisons
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                  {{ deliveryProfile?.totalDeliveries || 0 }}
                </dd>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Note moyenne
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                  {{ deliveryProfile?.rating || 0 }}/5
                </dd>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Statut
                </dt>
                <dd class="mt-1">
                  <span
                    :class="[
                      'px-2 py-1 text-sm font-medium rounded-full',
                      isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ isAvailable ? "Disponible" : "Indisponible" }}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          <!-- Commande en cours -->
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Commande en cours
            </h2>
            <div v-if="currentDelivery" class="bg-white border rounded-lg p-6">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-lg font-medium text-gray-900">
                    Commande #{{ currentDelivery.id?.slice(-6).toUpperCase() }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(currentDelivery.createdAt) }}
                  </p>
                </div>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800"
                >
                  En livraison
                </span>
              </div>

              <div class="mt-4">
                <div class="flex items-center space-x-2">
                  <svg
                    class="h-5 w-5 text-gray-400"
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
                  <span class="text-sm text-gray-900">{{
                    currentDelivery.customerAddress
                  }}</span>
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  {{ currentDelivery.deliveryNotes }}
                </div>
              </div>

              <div class="mt-6">
                <h3 class="text-sm font-medium text-gray-900">Articles</h3>
                <ul class="mt-2 divide-y divide-gray-200">
                  <li
                    v-for="item in currentDelivery.items"
                    :key="item.menuItemId"
                    class="py-2 flex justify-between"
                  >
                    <span class="text-sm text-gray-900"
                      >{{ item.quantity }}x {{ item.name }}</span
                    >
                    <span class="text-sm font-medium text-gray-900">{{
                      formatPrice(item.price * item.quantity)
                    }}</span>
                  </li>
                </ul>
                <div
                  class="mt-4 pt-4 border-t border-gray-200 flex justify-between"
                >
                  <span class="text-sm font-medium text-gray-900">Total</span>
                  <span class="text-sm font-medium text-gray-900">{{
                    formatPrice(currentDelivery.total)
                  }}</span>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-4">
                <button
                  @click="updateLocation"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Mettre à jour la position
                </button>
                <button
                  @click="completeDelivery"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Marquer comme livrée
                </button>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500">Aucune livraison en cours</p>
            </div>
          </div>

          <!-- Historique des livraisons -->
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Historique des livraisons
            </h2>
            <div class="space-y-4">
              <div
                v-for="delivery in deliveryHistory"
                :key="delivery.id"
                class="bg-white border rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">
                      Commande #{{ delivery.id?.slice(-6).toUpperCase() }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ formatDate(delivery.createdAt) }}
                    </p>
                  </div>
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    Livrée
                  </span>
                </div>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ delivery.customerAddress }}
                  </p>
                  <p class="mt-1 text-sm font-medium text-gray-900">
                    Total: {{ formatPrice(delivery.total) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  doc,
  getDoc,
  updateDoc,
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DeliveryProfile, Order } from "../../stores/restaurant";

const authStore = useAuthStore();
const deliveryProfile = ref<DeliveryProfile | null>(null);
const isAvailable = ref(false);
const currentDelivery = ref<Order | null>(null);
const deliveryHistory = ref<Order[]>([]);
let unsubscribeOrders: (() => void) | null = null;

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: Date) => {
  return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
};

const fetchDeliveryProfile = async () => {
  if (!authStore.user) return;

  const profileDoc = await getDoc(
    doc(db, "deliveryProfiles", authStore.user.uid)
  );
  if (profileDoc.exists()) {
    deliveryProfile.value = {
      id: profileDoc.id,
      ...profileDoc.data(),
    } as DeliveryProfile;
    isAvailable.value = deliveryProfile.value.isAvailable;
  }
};

const toggleAvailability = async () => {
  if (!authStore.user) return;

  const newStatus = !isAvailable.value;
  await updateDoc(doc(db, "deliveryProfiles", authStore.user.uid), {
    isAvailable: newStatus,
  });
  isAvailable.value = newStatus;
};

const updateLocation = async () => {
  if (!authStore.user || !navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    await updateDoc(doc(db, "deliveryProfiles", authStore.user!.uid), {
      currentLocation: { lat: latitude, lng: longitude },
    });
  });
};

const completeDelivery = async () => {
  if (!currentDelivery.value?.id) return;

  await updateDoc(doc(db, "orders", currentDelivery.value.id), {
    status: "delivered",
    deliveredAt: new Date(),
    trackingHistory: [
      ...currentDelivery.value.trackingHistory,
      {
        status: "delivered",
        timestamp: new Date(),
        note: "Commande livrée",
      },
    ],
  });

  // Mettre à jour les statistiques du livreur
  if (deliveryProfile.value) {
    await updateDoc(doc(db, "deliveryProfiles", authStore.user!.uid), {
      totalDeliveries: (deliveryProfile.value.totalDeliveries || 0) + 1,
    });
  }
};

onMounted(async () => {
  await fetchDeliveryProfile();

  if (!authStore.user) return;

  // Écouter les commandes assignées
  const q = query(
    collection(db, "orders"),
    where("deliveryId", "==", authStore.user.uid)
  );

  unsubscribeOrders = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        } as Order)
    );

    currentDelivery.value =
      orders.find((order) => order.status === "delivering") || null;
    deliveryHistory.value = orders
      .filter((order) => order.status === "delivered")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });
});

onUnmounted(() => {
  if (unsubscribeOrders) {
    unsubscribeOrders();
  }
});
</script>
