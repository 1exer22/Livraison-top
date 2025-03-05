<template>
  <div class="order-card bg-white rounded-lg shadow-sm border">
    <!-- En-tête -->
    <div class="p-4 border-b">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center">
            <h3 class="text-lg font-medium">Commande #{{ order.number }}</h3>
            <status-badge :status="order.status" class="ml-3" />
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {{ formatDate(order.createdAt) }}
          </p>
        </div>
        <div class="text-right">
          <p class="font-medium">{{ formatPrice(order.total) }}</p>
          <p class="text-sm text-gray-500">
            {{ order.items.length }} article(s)
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu -->
    <div class="p-4">
      <!-- Restaurant -->
      <div class="flex items-center mb-4">
        <img
          :src="order.restaurant.image"
          :alt="order.restaurant.name"
          class="w-12 h-12 rounded-lg object-cover"
        />
        <div class="ml-3">
          <h4 class="font-medium">{{ order.restaurant.name }}</h4>
          <p class="text-sm text-gray-500">{{ order.restaurant.address }}</p>
        </div>
      </div>

      <!-- Articles -->
      <div class="space-y-2 mb-4">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex justify-between items-center"
        >
          <div class="flex items-center">
            <span class="font-medium">{{ item.quantity }}x</span>
            <span class="ml-2">{{ item.name }}</span>
          </div>
          <span>{{ formatPrice(item.price * item.quantity) }}</span>
        </div>
      </div>

      <!-- Détails de livraison -->
      <div class="border-t pt-4">
        <div class="flex items-start">
          <i class="fas fa-map-marker-alt text-gray-400 mt-1"></i>
          <div class="ml-3">
            <p class="font-medium">Adresse de livraison</p>
            <p class="text-sm text-gray-500">{{ order.deliveryAddress }}</p>
            <p class="text-sm text-gray-500">
              {{ order.deliveryInstructions }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex justify-between items-center">
        <div class="flex space-x-2">
          <button v-if="canCancel" @click="cancelOrder" class="btn-danger">
            Annuler
          </button>
          <button v-if="canReorder" @click="reorder" class="btn-secondary">
            Commander à nouveau
          </button>
        </div>
        <button @click="showDetails" class="btn-primary">
          Voir les détails
        </button>
      </div>
    </div>

    <!-- Barre de progression (pour les commandes en cours) -->
    <div v-if="isInProgress" class="border-t">
      <div class="p-4">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium">Progression de la commande</span>
          <span class="text-sm text-gray-500">
            {{ getProgressLabel() }}
          </span>
        </div>
        <div class="relative pt-1">
          <div
            class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100"
          >
            <div
              :style="{ width: `${getProgressPercentage()}%` }"
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import StatusBadge from "@/components/common/StatusBadge.vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["cancel", "reorder", "show-details"]);

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isInProgress = computed(() => {
  const progressStatuses = ["confirmed", "preparing", "ready", "delivering"];
  return progressStatuses.includes(props.order.status);
});

const canCancel = computed(() => {
  return ["pending", "confirmed"].includes(props.order.status);
});

const canReorder = computed(() => {
  return ["delivered", "cancelled"].includes(props.order.status);
});

const getProgressPercentage = () => {
  const stages = {
    confirmed: 25,
    preparing: 50,
    ready: 75,
    delivering: 90,
    delivered: 100,
  };
  return stages[props.order.status] || 0;
};

const getProgressLabel = () => {
  const labels = {
    confirmed: "Commande confirmée",
    preparing: "En préparation",
    ready: "Prête pour livraison",
    delivering: "En cours de livraison",
    delivered: "Livrée",
  };
  return labels[props.order.status] || "";
};

const cancelOrder = () => {
  emit("cancel", props.order.id);
};

const reorder = () => {
  emit("reorder", props.order.id);
};

const showDetails = () => {
  emit("show-details", props.order.id);
};
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
         transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}

.btn-danger {
  @apply px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 
         transition-colors duration-200;
}
</style>
