<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Gestion des Commandes</h2>
      <div class="flex space-x-2">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="[
            'px-3 py-1 rounded-md text-sm font-medium',
            currentFilter === filter.value
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-gray-50 p-6 rounded-lg"
      >
        <div class="flex justify-between items-start">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-medium text-gray-900">
                Commande #{{ order.id?.slice(-6).toUpperCase() }}
              </h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  getStatusClass(order.status),
                ]"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <select
              v-if="canChangeStatus(order)"
              v-model="order.status"
              @change="updateStatus(order.id!, $event)"
              class="rounded-md border-gray-300 text-sm"
            >
              <option
                v-for="status in getAvailableStatuses(order)"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>

            <!-- Bouton pour assigner un livreur -->
            <button
              v-if="order.status === 'ready' && !order.deliveryId"
              @click="assignDelivery(order)"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Assigner un livreur
            </button>
          </div>
        </div>

        <div class="mt-4">
          <h4 class="font-medium text-gray-900">Détails de la commande</h4>
          <ul class="mt-2 space-y-2">
            <li
              v-for="item in order.items"
              :key="item.menuItemId"
              class="flex justify-between text-sm"
            >
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span class="font-medium">{{
                formatPrice(item.price * item.quantity)
              }}</span>
            </li>
          </ul>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between text-sm font-medium">
              <span>Total</span>
              <span>{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Informations client -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="font-medium text-gray-900 mb-2">Informations client</h4>
          <div class="space-y-1 text-sm">
            <p>
              <span class="font-medium">Nom:</span> {{ order.customerName }}
            </p>
            <p>
              <span class="font-medium">Adresse:</span>
              {{ order.customerAddress }}
            </p>
            <p v-if="order.deliveryNotes">
              <span class="font-medium">Instructions:</span>
              {{ order.deliveryNotes }}
            </p>
          </div>
        </div>

        <!-- Informations livreur -->
        <div v-if="order.deliveryId" class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="font-medium text-gray-900 mb-2">Informations livreur</h4>
          <div class="space-y-1 text-sm">
            <p>
              <span class="font-medium">Livreur:</span>
              {{ getDeliveryInfo(order.deliveryId)?.name || "Chargement..." }}
            </p>
            <p>
              <span class="font-medium">Téléphone:</span>
              {{ getDeliveryInfo(order.deliveryId)?.phone || "Chargement..." }}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="font-medium text-gray-900 mb-2">
            Historique de la commande
          </h4>
          <div class="space-y-2">
            <div
              v-for="(event, index) in order.trackingHistory"
              :key="index"
              class="flex items-start space-x-2 text-sm"
            >
              <div class="flex-shrink-0">
                <div class="h-2 w-2 rounded-full bg-indigo-600 mt-2"></div>
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ getStatusLabel(event.status) }}
                </p>
                <p class="text-gray-500">
                  {{ formatDate(event.timestamp) }}
                  <span v-if="event.note" class="ml-2">- {{ event.note }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="filteredOrders.length === 0"
        class="text-center text-gray-500 py-8"
      >
        Aucune commande
        {{ currentFilter === "all" ? "" : "dans cette catégorie" }}
      </div>
    </div>

    <!-- Modal d'assignation de livreur -->
    <div
      v-if="showDeliveryModal"
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
          @click="showDeliveryModal = false"
        ></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Assigner un livreur
            </h3>

            <div class="mt-4 space-y-4">
              <div v-if="availableDeliverers.length > 0">
                <div
                  v-for="deliverer in availableDeliverers"
                  :key="deliverer.id"
                  class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  @click="selectDeliverer(deliverer)"
                >
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ deliverer.name }}
                    </p>
                    <p class="text-sm text-gray-500">{{ deliverer.phone }}</p>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ deliverer.totalDeliveries }} livraisons -
                    {{ deliverer.rating }}/5
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500">
                Aucun livreur disponible pour le moment
              </div>
            </div>
          </div>

          <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showDeliveryModal = false"
              class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
import { useRestaurantStore } from "../../stores/restaurant";
import type { Order, OrderStatus } from "../../stores/restaurant";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const restaurantStore = useRestaurantStore();
const currentFilter = ref<"all" | string>("all");
const showDeliveryModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const availableDeliverers = ref<any[]>([]);
const deliverersInfo = ref<Map<string, any>>(new Map());

const statusFilters = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Acceptées" },
  { value: "preparing", label: "En préparation" },
  { value: "ready", label: "Prêtes" },
  { value: "delivering", label: "En livraison" },
  { value: "delivered", label: "Livrées" },
];

const availableStatuses = [
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Acceptée" },
  { value: "preparing", label: "En préparation" },
  { value: "ready", label: "Prête" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

const filteredOrders = computed(() => {
  if (currentFilter.value === "all") {
    return restaurantStore.orders;
  }
  return restaurantStore.orders.filter(
    (order) => order.status === currentFilter.value
  );
});

const canChangeStatus = (order: Order) => {
  return (
    !order.deliveryId &&
    order.status !== "delivered" &&
    order.status !== "cancelled"
  );
};

const getAvailableStatuses = (order: Order) => {
  if (order.status === "delivered" || order.status === "cancelled") {
    return availableStatuses.filter((s) => s.value === order.status);
  }
  return availableStatuses.filter((s) => s.value !== "delivering");
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "En attente",
    accepted: "Acceptée",
    preparing: "En préparation",
    ready: "Prête",
    delivering: "En livraison",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    ready: "bg-green-100 text-green-800",
    delivering: "bg-indigo-100 text-indigo-800",
    delivered: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: Date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
};

const updateStatus = async (orderId: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  const status = target.value as OrderStatus;
  await restaurantStore.updateOrderStatus(orderId, status);
};

const assignDelivery = async (order: Order) => {
  selectedOrder.value = order;
  showDeliveryModal.value = true;

  // Charger les livreurs disponibles
  const q = query(
    collection(db, "deliveryProfiles"),
    where("isAvailable", "==", true)
  );

  const snapshot = await getDocs(q);
  availableDeliverers.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const selectDeliverer = async (deliverer: any) => {
  if (!selectedOrder.value?.id) return;

  const orderId = selectedOrder.value.id;
  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    deliveryId: deliverer.id,
    status: "delivering",
    trackingHistory: [
      ...selectedOrder.value.trackingHistory,
      {
        status: "delivering",
        timestamp: new Date(),
        note: `Commande assignée au livreur ${deliverer.name}`,
      },
    ],
  });

  showDeliveryModal.value = false;
  selectedOrder.value = null;
};

const getDeliveryInfo = async (deliveryId: string) => {
  if (!deliverersInfo.value.has(deliveryId)) {
    const deliveryDoc = await getDoc(doc(db, "deliveryProfiles", deliveryId));
    if (deliveryDoc.exists()) {
      deliverersInfo.value.set(deliveryId, deliveryDoc.data());
    }
  }
  return deliverersInfo.value.get(deliveryId);
};

onMounted(() => {
  restaurantStore.startOrdersListener();
});
</script>
