<template>
  <div class="shopping-cart sticky top-4">
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h2 class="text-xl font-bold mb-4">Votre commande</h2>
      
      <div v-if="items.length === 0" class="text-center text-gray-500 py-4">
        Votre panier est vide
      </div>

      <div v-else>
        <div v-for="item in items" :key="item.id" class="cart-item">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-semibold">{{ item.name }}</h4>
              <p class="text-sm text-gray-600">{{ item.price }}€</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="updateQuantity(item.id, item.quantity - 1)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t">
          <div class="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{{ subtotal }}€</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Livraison</span>
            <span>{{ deliveryFee }}€</span>
          </div>
          <div class="flex justify-between font-bold">
            <span>Total</span>
            <span>{{ total }}€</span>
          </div>
        </div>

        <button 
          @click="proceedToCheckout"
          class="checkout-btn w-full mt-4"
        >
          Commander
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const deliveryFee = computed(() => 2.99)

const total = computed(() => {
  return subtotal.value + deliveryFee.value
})

const updateQuantity = (itemId, quantity) => {
  if (quantity < 1) {
    cartStore.removeItem(itemId)
  } else {
    cartStore.updateItemQuantity(itemId, quantity)
  }
}

const proceedToCheckout = () => {
  router.push('/checkout')
}
</script>

<style lang="scss" scoped>
.cart-item {
  @apply py-2 border-b last:border-b-0;
}

.checkout-btn {
  @apply bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors;
}
</style>
