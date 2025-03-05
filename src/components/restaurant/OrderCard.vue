<template>
  <div class="order-card bg-white rounded-lg shadow-sm border p-4">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="font-bold">#{{ order.number }}</h3>
        <p class="text-sm text-gray-600">{{ formatTime(order.createdAt) }}</p>
      </div>
      <status-badge :status="order.status" />
    </div>

    <div class="space-y-2 mb-4">
      <div
        v-for="item in order.items"
        :key="item.id"
        class="flex justify-between"
      >
        <span>{{ item.quantity }}x {{ item.name }}</span>
        <span class="text-gray-600">{{
          formatPrice(item.price * item.quantity)
        }}</span>
      </div>
    </div>

    <div class="border-t pt-4">
      <div class="flex justify-between items-center mb-4">
        <span class="font-bold">Total</span>
        <span class="font-bold">{{ formatPrice(order.total) }}</span>
      </div>

      <div class="flex gap-2">
        <button
          v-if="canAccept"
          @click="$emit('status-change', order.id, 'accepted')"
          class="btn-primary"
        >
          Accepter
        </button>
        <button
          v-if="canPrepare"
          @click="$emit('status-change', order.id, 'preparing')"
          class="btn-secondary"
        >
          En préparation
        </button>
        <button
          v-if="canComplete"
          @click="$emit('status-change', order.id, 'ready')"
          class="btn-success"
        >
          Prêt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import StatusBadge from "../components/common/StatusBadge.vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const canAccept = computed(() => props.order.status === "pending");
const canPrepare = computed(() => props.order.status === "accepted");
const canComplete = computed(() => props.order.status === "preparing");

defineEmits(["status-change"]);
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600;
}

.btn-secondary {
  @apply bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600;
}

.btn-success {
  @apply bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600;
}
</style>
