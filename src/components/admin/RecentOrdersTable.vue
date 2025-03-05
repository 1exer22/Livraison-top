<template>
  <div class="recent-orders">
    <table class="min-w-full">
      <thead>
        <tr>
          <th class="text-left">N° Commande</th>
          <th class="text-left">Restaurant</th>
          <th class="text-left">Client</th>
          <th class="text-right">Montant</th>
          <th class="text-center">Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id" class="border-t">
          <td class="py-3">#{{ order.number }}</td>
          <td>{{ order.restaurant.name }}</td>
          <td>{{ order.customer.name }}</td>
          <td class="text-right">{{ formatPrice(order.total) }}</td>
          <td class="text-center">
            <status-badge :status="order.status" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import StatusBadge from '@/components/common/StatusBadge.vue'

defineProps({
  orders: {
    type: Array,
    required: true
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
</script>
