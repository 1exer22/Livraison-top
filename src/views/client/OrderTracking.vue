<template>
  <div class="order-tracking">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">
            Suivi de commande #{{ order?.number }}
          </h1>
          <span :class="['status-badge', order?.status]">
            {{ getStatusLabel(order?.status) }}
          </span>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Carte et suivi -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm mb-6">
            <div id="map" class="h-[400px] rounded-lg"></div>
          </div>

          <!-- Timeline de livraison -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-6">Statut de la livraison</h2>
            <div class="delivery-timeline">
              <div
                v-for="(step, index) in deliverySteps"
                :key="step.status"
                :class="[
                  'timeline-step',
                  { completed: isStepCompleted(step.status) },
                ]"
              >
                <div class="step-icon">
                  <i :class="step.icon"></i>
                </div>
                <div class="step-content">
                  <h3 class="step-title">{{ step.label }}</h3>
                  <p class="step-time">{{ getStepTime(step.status) }}</p>
                </div>
                <div
                  v-if="index < deliverySteps.length - 1"
                  class="step-line"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Détails de la commande -->
        <div class="space-y-6">
          <!-- Résumé -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Détails de la commande</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Heure de commande</span>
                <span>{{ formatDateTime(order?.createdAt) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Livraison estimée</span>
                <span>{{ formatDateTime(order?.estimatedDelivery) }}</span>
              </div>
              <div class="border-t pt-4">
                <h3 class="font-medium mb-2">Articles commandés</h3>
                <div class="space-y-2">
                  <div
                    v-for="item in order?.items"
                    :key="item.id"
                    class="flex justify-between text-sm"
                  >
                    <span>{{ item.quantity }}x {{ item.name }}</span>
                    <span>{{ formatPrice(item.price * item.quantity) }}</span>
                  </div>
                </div>
              </div>
              <div class="border-t pt-4">
                <div class="flex justify-between text-sm mb-2">
                  <span>Sous-total</span>
                  <span>{{ formatPrice(order?.subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm mb-2">
                  <span>Frais de livraison</span>
                  <span>{{ formatPrice(order?.deliveryFee) }}</span>
                </div>
                <div class="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{{ formatPrice(order?.total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Livreur -->
          <div v-if="order?.driver" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Votre livreur</h2>
            <div class="flex items-center">
              <img
                :src="order.driver.avatar"
                :alt="order.driver.name"
                class="w-12 h-12 rounded-full"
              />
              <div class="ml-4">
                <h3 class="font-medium">{{ order.driver.name }}</h3>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-star text-yellow-400 mr-1"></i>
                  <span>{{ order.driver.rating }}/5</span>
                </div>
              </div>
              <button @click="contactDriver" class="ml-auto btn-outline">
                <i class="fas fa-phone mr-2"></i>Contacter
              </button>
            </div>
          </div>

          <!-- Restaurant -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Restaurant</h2>
            <div class="flex items-center">
              <img
                :src="order?.restaurant.image"
                :alt="order?.restaurant.name"
                class="w-12 h-12 rounded-lg"
              />
              <div class="ml-4">
                <h3 class="font-medium">{{ order?.restaurant.name }}</h3>
                <p class="text-sm text-gray-600">
                  {{ order?.restaurant.address }}
                </p>
              </div>
            </div>
          </div>

          <!-- Support -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Besoin d'aide ?</h2>
            <div class="space-y-3">
              <button @click="openSupportChat" class="btn-primary w-full">
                <i class="fas fa-comments mr-2"></i>Contacter le support
              </button>
              <button @click="reportIssue" class="btn-outline w-full">
                <i class="fas fa-exclamation-circle mr-2"></i>Signaler un
                problème
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { initMap, updateDeliveryMarkers } from "@/services/mapService";

const route = useRoute();
const orderStore = useOrderStore();

const order = ref(null);
const map = ref(null);
let orderSubscription = null;

const deliverySteps = [
  {
    status: "confirmed",
    label: "Commande confirmée",
    icon: "fas fa-check text-green-500",
  },
  {
    status: "preparing",
    label: "En préparation",
    icon: "fas fa-utensils text-orange-500",
  },
  {
    status: "ready",
    label: "Prête pour livraison",
    icon: "fas fa-box text-blue-500",
  },
  {
    status: "delivering",
    label: "En cours de livraison",
    icon: "fas fa-motorcycle text-purple-500",
  },
  {
    status: "delivered",
    label: "Livrée",
    icon: "fas fa-home text-green-500",
  },
];

const getStatusLabel = (status) => {
  const labels = {
    confirmed: "Confirmée",
    preparing: "En préparation",
    ready: "Prête",
    delivering: "En livraison",
    delivered: "Livrée",
  };
  return labels[status] || status;
};

const isStepCompleted = (status) => {
  const currentIndex = deliverySteps.findIndex(
    (step) => step.status === order.value?.status
  );
  const stepIndex = deliverySteps.findIndex((step) => step.status === status);
  return stepIndex <= currentIndex;
};

const getStepTime = (status) => {
  const timestamp = order.value?.statusHistory?.[status];
  return timestamp ? formatTime(timestamp) : "";
};

const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const contactDriver = () => {
  if (order.value?.driver?.phone) {
    window.location.href = `tel:${order.value.driver.phone}`;
  }
};

const openSupportChat = () => {
  // Implémenter l'ouverture du chat support
};

const reportIssue = () => {
  // Implémenter le signalement de problème
};

const initializeMap = async () => {
  map.value = await initMap("map");
  if (order.value) {
    updateDeliveryMarkers(map.value, {
      restaurant: order.value.restaurant.location,
      delivery: order.value.deliveryAddress,
      driver: order.value.driver?.location,
    });
  }
};

const subscribeToOrderUpdates = () => {
  orderSubscription = orderStore.subscribeToOrder(
    route.params.id,
    (updatedOrder) => {
      order.value = updatedOrder;
      if (map.value && updatedOrder.driver?.location) {
        updateDeliveryMarkers(map.value, {
          driver: updatedOrder.driver.location,
        });
      }
    }
  );
};

onMounted(async () => {
  try {
    order.value = await orderStore.getOrder(route.params.id);
    await initializeMap();
    subscribeToOrderUpdates();
  } catch (error) {
    console.error("Erreur de chargement de la commande:", error);
  }
});

onUnmounted(() => {
  if (orderSubscription) {
    orderSubscription();
  }
});
</script>

<style lang="scss" scoped>
.status-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;

  &.confirmed {
    @apply bg-blue-100 text-blue-800;
  }
  &.preparing {
    @apply bg-yellow-100 text-yellow-800;
  }
  &.ready {
    @apply bg-green-100 text-green-800;
  }
  &.delivering {
    @apply bg-purple-100 text-purple-800;
  }
  &.delivered {
    @apply bg-gray-100 text-gray-800;
  }
}

.delivery-timeline {
  @apply relative space-y-8;
}

.timeline-step {
  @apply flex items-start relative;

  &.completed {
    .step-icon {
      @apply bg-green-500 text-white;
    }
    .step-line {
      @apply bg-green-500;
    }
  }
}

.step-icon {
  @apply w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0;
}

.step-content {
  @apply ml-4 flex-grow;
}

.step-title {
  @apply font-medium;
}

.step-time {
  @apply text-sm text-gray-600;
}

.step-line {
  @apply absolute left-4 top-8 w-0.5 h-8 -ml-0.5 bg-gray-200;
}

.btn-primary {
  @apply flex items-center justify-center px-4 py-2 bg-primary-600 text-white 
         rounded-lg hover:bg-primary-700 transition-colors duration-200;
}

.btn-outline {
  @apply flex items-center justify-center px-4 py-2 border border-gray-300 
         text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200;
}
</style>
