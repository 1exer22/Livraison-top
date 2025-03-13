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
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Commande en cours
            </h2>
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

              <!-- Timeline de la commande -->
              <div class="relative">
                <div
                  class="absolute top-0 left-4 h-full w-0.5 bg-gray-200"
                ></div>
                <div class="space-y-6">
                  <div
                    v-for="(event, index) in currentOrder.trackingHistory"
                    :key="index"
                    class="relative flex items-start"
                  >
                    <div
                      :class="[
                        'absolute left-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center',
                        event.status === currentOrder.status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-400',
                      ]"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-12">
                      <p class="text-sm font-medium text-gray-900">
                        {{ getStatusLabel(event.status) }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ formatDate(event.timestamp) }}
                        <span v-if="event.note" class="ml-2"
                          >- {{ event.note }}</span
                        >
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Détails de la commande -->
              <div class="mt-6 border-t border-gray-200 pt-4">
                <h3 class="text-sm font-medium text-gray-900">
                  Détails de la commande
                </h3>
                <ul class="mt-2 divide-y divide-gray-200">
                  <li
                    v-for="item in currentOrder.items"
                    :key="item.menuItemId"
                    class="py-2 flex justify-between"
                  >
                    <div class="flex items-center">
                      <span class="text-sm">{{ item.quantity }}x</span>
                      <span class="ml-2 text-sm text-gray-900">{{
                        item.name
                      }}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">
                      {{ formatPrice(item.price * item.quantity) }}
                    </span>
                  </li>
                </ul>
                <div class="mt-4 flex justify-between">
                  <span class="text-sm font-medium text-gray-900">Total</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatPrice(currentOrder.total) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historique des commandes -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Historique des commandes
            </h2>
            <div class="space-y-4">
              <div
                v-for="order in pastOrders"
                :key="order.id"
                class="border rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      Commande #{{ order.id?.slice(-6).toUpperCase() }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ formatDate(order.createdAt) }}
                    </p>
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      getStatusClass(order.status),
                    ]"
                  >
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>
                <div class="mt-4">
                  <p class="text-sm text-gray-500">
                    {{ order.items.length }} articles - Total:
                    {{ formatPrice(order.total) }}
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

const currentOrder = computed(() => {
  return orders.value.find((order) =>
    ["pending", "accepted", "preparing", "ready", "delivering"].includes(
      order.status
    )
  );
});

const pastOrders = computed(() => {
  return orders.value
    .filter((order) => ["delivered", "cancelled"].includes(order.status))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

const getStatusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    pending: "En attente de confirmation",
    accepted: "Commande acceptée",
    preparing: "En préparation",
    ready: "Prête à être livrée",
    delivering: "En cours de livraison",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  return labels[status];
};

const getStatusClass = (status: OrderStatus) => {
  const classes: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    ready: "bg-green-100 text-green-800",
    delivering: "bg-indigo-100 text-indigo-800",
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

const formatDate = (date: Date) => {
  return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
};

onMounted(() => {
  if (!authStore.user) return;

  const q = query(
    collection(db, "orders"),
    where("customerId", "==", authStore.user.uid),
    orderBy("createdAt", "desc")
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    orders.value = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        } as Order)
    );
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
