<template>
  <modal-base :show="show" @close="$emit('close')">
    <template #title> Détails de la commande #{{ order.number }} </template>

    <template #content>
      <div class="space-y-6">
        <!-- Informations client -->
        <div>
          <h3 class="font-semibold mb-2">Client</h3>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p>{{ order.customer.name }}</p>
            <p>{{ order.customer.phone }}</p>
            <p class="text-sm text-gray-600">{{ order.deliveryAddress }}</p>
          </div>
        </div>

        <!-- Articles commandés -->
        <div>
          <h3 class="font-semibold mb-2">Articles</h3>
          <div class="space-y-2">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div>
                <span class="font-medium">{{ item.quantity }}x</span>
                {{ item.name }}
                <div v-if="item.options?.length" class="text-sm text-gray-600">
                  {{ item.options.map((opt) => opt.name).join(", ") }}
                </div>
              </div>
              <span>{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <!-- Résumé des prix -->
        <div class="border-t pt-4">
          <div class="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{{ formatPrice(order.subtotal) }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Frais de livraison</span>
            <span>{{ formatPrice(order.deliveryFee) }}</span>
          </div>
          <div class="flex justify-between font-bold">
            <span>Total</span>
            <span>{{ formatPrice(order.total) }}</span>
          </div>
        </div>

        <!-- Timeline de la commande -->
        <div>
          <h3 class="font-semibold mb-2">Suivi de la commande</h3>
          <div class="space-y-4">
            <div
              v-for="(status, index) in order.statusHistory"
              :key="index"
              class="flex gap-4"
            >
              <div class="w-8 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-primary-500"></div>
              </div>
              <div>
                <p class="font-medium">{{ getStatusLabel(status.status) }}</p>
                <p class="text-sm text-gray-600">
                  {{ formatDate(status.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button @click="$emit('close')" class="btn-secondary">Fermer</button>
      <button v-if="canPrint" @click="printOrder" class="btn-primary">
        <i class="fas fa-print mr-2"></i>Imprimer
      </button>
    </template>
  </modal-base>
</template>

<script setup>
import { computed } from "vue";
import ModalBase from "../components/common/ModalBase.vue";

const props = defineProps({
  show: Boolean,
  order: Object,
});

const emit = defineEmits(["close"]);

const canPrint = computed(() => {
  return ["accepted", "preparing", "ready"].includes(props.order?.status);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR");
};

const getStatusLabel = (status) => {
  const labels = {
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

const printOrder = () => {
  // Logique d'impression
  window.print();
};
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300;
}
</style>
