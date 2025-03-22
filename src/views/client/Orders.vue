<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <div class="flex items-center space-x-4">
          <router-link
            to="/profile"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Mon profil
          </router-link>
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
      <div class="space-y-6">
        <!-- Commande en cours -->
        <div
          v-if="currentOrder"
          class="bg-white shadow rounded-lg overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-medium text-gray-900">
                Commande en cours
              </h2>
              <router-link
                :to="'/orders/' + currentOrder.id"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                Voir les détails
                <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    Commande #{{ currentOrder.id?.slice(-6).toUpperCase() }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(currentOrder.createdAt) }}
                  </p>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusClass(currentOrder.status),
                  ]"
                >
                  {{ getStatusLabel(currentOrder.status) }}
                </span>
              </div>

              <!-- Résumé de la commande en cours -->
              <div class="mt-4 border-t pt-4">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>{{ currentOrder.items.length }} articles</span>
                  <span>Total: {{ formatPrice(currentOrder.total) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtres et recherche -->
        <div class="mb-6 flex items-center justify-between">
          <div class="flex space-x-4">
            <select
              v-model="statusFilter"
              class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prêt</option>
              <option value="delivering">En livraison</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
            <input
              type="date"
              v-model="dateFilter"
              class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            @click="clearFilters"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Statistiques -->
        <div class="mb-6 grid grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-sm font-medium text-gray-500">Total des commandes</h3>
            <p class="mt-2 text-3xl font-semibold text-gray-900">
              {{ orders.length }}
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-sm font-medium text-gray-500">Montant total dépensé</h3>
            <p class="mt-2 text-3xl font-semibold text-gray-900">
              {{ formatPrice(totalSpent) }}
            </p>
          </div>
          <!-- <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-sm font-medium text-gray-500">Restaurant favori</h3>
            <p class="mt-2 text-lg font-semibold text-gray-900">
              {{ favoriteRestaurant || "Aucun" }}
            </p>
          </div> -->
        </div>

        <!-- Liste des commandes -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Historique des commandes
            </h2>
            <div class="space-y-4">
              <div
                v-for="order in filteredOrders.slice(paginationStart, paginationStart + itemsPerPage)"
                :key="order.id"
                class="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      Commande #{{ order.id?.slice(-6).toUpperCase() }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ formatDate(order.createdAt) }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ order.items.length }} articles - Total: {{ formatPrice(order.total) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusClass(order.status),
                      ]"
                    >
                      {{ getStatusLabel(order.status) }}
                    </span>
                    <router-link
                      :to="'/orders/' + order.id"
                      class="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <span class="sr-only">Voir les détails</span>
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="mt-6 flex justify-between items-center">
              <p class="text-sm text-gray-700">
                Affichage de {{ paginationStart + 1 }} à
                {{ Math.min(paginationStart + itemsPerPage, filteredOrders.length) }}
                sur {{ filteredOrders.length }} commandes
              </p>
              <div class="flex space-x-2">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  :class="[
                    'px-3 py-1 rounded-md',
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700',
                  ]"
                >
                  Précédent
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  :class="[
                    'px-3 py-1 rounded-md',
                    currentPage >= totalPages
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700',
                  ]"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Order, OrderStatus } from "../../stores/restaurant";

const authStore = useAuthStore();
const orders = ref<Order[]>([]);
let unsubscribe: (() => void) | null = null;

// Filtres
const statusFilter = ref("");
const dateFilter = ref("");

// Pagination
const itemsPerPage = 5;
const currentPage = ref(1);
const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage);

// Computed properties
const currentOrder = computed(() => {
  return orders.value.find((order) =>
    ["pending", "preparing", "ready", "delivering"].includes(order.status)
  );
});

const totalSpent = computed(() => {
  return orders.value.reduce((total, order) => total + order.total, 0);
});

const favoriteRestaurant = computed(() => {
  const restaurants = orders.value.reduce((acc, order) => {
    acc[order.restaurantId] = (acc[order.restaurantId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(restaurants).sort((a, b) => b[1] - a[1])[0]?.[0];
});

const filteredOrders = computed(() => {
  let filtered = [...orders.value];
  
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }
  
  if (dateFilter.value) {
    const selectedDate = new Date(dateFilter.value);
    filtered = filtered.filter(order => {
      const orderDate = order.createdAt instanceof Date 
        ? order.createdAt 
        : new Date(order.createdAt.seconds * 1000);
      return (
        orderDate.getFullYear() === selectedDate.getFullYear() &&
        orderDate.getMonth() === selectedDate.getMonth() &&
        orderDate.getDate() === selectedDate.getDate()
      );
    });
  }
  
  return filtered.sort((a, b) => {
    // Gestion des différents formats de date possibles
    const dateA = a.createdAt instanceof Date 
      ? a.createdAt.getTime() 
      : a.createdAt.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
    
    const dateB = b.createdAt instanceof Date 
      ? b.createdAt.getTime() 
      : b.createdAt.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
    
    return dateB - dateA;
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / itemsPerPage)
);

// Methods
const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: "En attente",
    accepted: "Acceptée",
    preparing: "En préparation",
    ready: "Prêt",
    delivering: "En livraison",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return labels[status] || status;
};

const getStatusClass = (status: OrderStatus): string => {
  const classes: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    preparing: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    delivering: "bg-purple-100 text-purple-800",
    delivered: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classes[status];
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: any): string => {
  if (!date) return "Date inconnue";
  
  if (date?.toDate instanceof Function) {
    return format(date.toDate(), "dd/MM/yyyy HH:mm", { locale: fr });
  }
  
  if (date instanceof Date) {
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  }
  
  if (typeof date === "number") {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr });
  }
  
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr });
  } catch (error) {
    console.error("Erreur de formatage de la date:", error);
    return "Date invalide";
  }
};

const clearFilters = () => {
  statusFilter.value = "";
  dateFilter.value = "";
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

onMounted(() => {
  if (!authStore.user) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("ID utilisateur:", authStore.user.uid);

  // Requête temporaire sans filtre pour voir toutes les commandes
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    console.log("Nombre total de commandes:", snapshot.docs.length);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log("Structure commande:", {
        id: doc.id,
        userId: data.userId,
        clientId: data.clientId, // Vérifie si c'est clientId au lieu de userId
        customerId: data.customerId, // Vérifie si c'est customerId au lieu de userId
        ...data
      });
    });
    
    orders.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  }, (error) => {
    console.error("Erreur lors de la récupération des commandes:", error);
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
