<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Livreur</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <span class="mr-2 text-sm text-gray-500">Statut: </span>
            <span class="text-sm font-medium"
              :class="isAvailable ? 'text-green-600' : 'text-red-600'"
            >
              {{ isAvailable ? "Disponible" : "Indisponible" }}
            </span>
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
                <!-- Restaurant Information -->
                <div class="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Restaurant à collecter</h3>
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="h-5 w-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span class="text-sm font-medium text-gray-900">{{ restaurantNames[currentDelivery.restaurantId] || 'Chargement...' }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="h-5 w-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-sm text-gray-900">{{ restaurantAddresses[currentDelivery.restaurantId] || "Adresse non spécifiée" }}</span>
                  </div>
                </div>

                <!-- Client Information -->
                <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Client à livrer</h3>
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-sm font-medium text-gray-900">{{ currentDelivery.customerName }}</span>
                  </div>
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="text-sm text-gray-900">{{ clientPhones[currentDelivery.customerId] || "Téléphone non spécifié" }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-sm text-gray-900">{{ currentDelivery.customerAddress || "Adresse non spécifiée" }}</span>
                  </div>
                </div>

                <div class="mt-2 text-sm text-gray-500">
                  <div class="font-medium text-gray-900 mb-1">Instructions:</div>
                  {{ currentDelivery.deliveryNotes || "Aucune instruction spéciale" }}
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
import { db } from "../../firebase/config";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DeliveryProfile, Order, OrderStatus } from "../../stores/restaurant";

// State
const isAvailable = ref(false);
const deliveryProfile = ref<DeliveryProfile | null>(null);
const currentDelivery = ref<Order | null>(null);
const deliveryHistory = ref<Order[]>([]);
const unsubscribeOrders = ref<(() => void) | null>(null);
const restaurantNames = ref<Record<string, string>>({});
const restaurantAddresses = ref<Record<string, string>>({});
const clientPhones = ref<Record<string, string>>({});

const authStore = useAuthStore();

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

const updateLocation = async () => {
  if (!authStore.user || !navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    await updateDoc(doc(db, "deliveryProfiles", authStore.user!.uid), {
      currentLocation: {
        lat: latitude,
        lng: longitude,
      },
    });
  });
};

const completeDelivery = async () => {
  if (!currentDelivery.value || !authStore.user) return;

  // Mettre à jour le statut de la commande
  await updateDoc(doc(db, "orders", currentDelivery.value.id!), {
    status: "delivered",
    trackingHistory: [
      ...(currentDelivery.value.trackingHistory || []),
      {
        status: "delivered" as OrderStatus,
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

const getRestaurantName = async (restaurantId: string) => {
  // Vérifier si le nom est déjà dans le cache
  if (restaurantNames.value[restaurantId]) {
    return restaurantNames.value[restaurantId];
  }

  try {
    // Sinon récupérer le nom depuis la base de données
    const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
    if (restaurantDoc.exists()) {
      const restaurantData = restaurantDoc.data();
      // Mettre en cache le nom et l'adresse du restaurant
      restaurantNames.value[restaurantId] = restaurantData.name || "Restaurant sans nom";
      restaurantAddresses.value[restaurantId] = restaurantData.address || "Adresse non spécifiée";
      return restaurantNames.value[restaurantId];
    }
    return "Restaurant non trouvé";
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
    return "Erreur de chargement";
  }
};

const getClientPhone = async (clientId: string) => {
  // Vérifier si le numéro est déjà dans le cache
  if (clientPhones.value[clientId]) {
    return clientPhones.value[clientId];
  }

  try {
    // Récupérer le profil client depuis la base de données
    const clientDoc = await getDoc(doc(db, "clientProfiles", clientId));
    if (clientDoc.exists()) {
      const clientData = clientDoc.data();
      // Mettre en cache le numéro de téléphone
      clientPhones.value[clientId] = clientData.phone || "Téléphone non spécifié";
      return clientPhones.value[clientId];
    }
    return "Téléphone non spécifié";
  } catch (error) {
    console.error("Erreur lors de la récupération du profil client:", error);
    return "Erreur de chargement";
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

  unsubscribeOrders.value = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Order)
    );

    // Débogage - afficher toutes les commandes récupérées
    console.log("Commandes récupérées:", orders);
    
    // Trouver les commandes en livraison (vérifier différents statuts possibles)
    const deliveringOrder = orders.find(
      (order) => order.status === "delivering" || String(order.status) === "in_delivery" || String(order.status) === "en_livraison"
    );
    
    console.log("Commande en livraison trouvée:", deliveringOrder);
    currentDelivery.value = deliveringOrder || null;
    
    // Si une commande en cours est trouvée, récupérer les informations du restaurant et du client
    if (currentDelivery.value) {
      if (currentDelivery.value.restaurantId) {
        getRestaurantName(currentDelivery.value.restaurantId);
      }
      if (currentDelivery.value.customerId) {
        getClientPhone(currentDelivery.value.customerId);
      }
    }
    
    deliveryHistory.value = orders
      .filter((order) => order.status === "delivered" || String(order.status) === "livré" || String(order.status) === "complete")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    // Mise à jour du compteur de livraisons si nécessaire
    if (deliveryProfile.value && deliveryHistory.value.length > 0 && 
        (!deliveryProfile.value.totalDeliveries || deliveryProfile.value.totalDeliveries < deliveryHistory.value.length)) {
      updateDoc(doc(db, "deliveryProfiles", authStore.user.uid), {
        totalDeliveries: deliveryHistory.value.length
      }).then(() => {
        if (deliveryProfile.value) {
          deliveryProfile.value.totalDeliveries = deliveryHistory.value.length;
        }
      });
    }
  });
});

onUnmounted(() => {
  if (unsubscribeOrders.value) {
    unsubscribeOrders.value();
    unsubscribeOrders.value = null as unknown as (() => void);
  }
});
</script>
