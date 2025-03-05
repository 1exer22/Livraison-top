<template>
  <div class="checkout-page max-w-6xl mx-auto p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Informations de livraison -->
      <div class="delivery-info">
        <h2 class="text-2xl font-bold mb-6">Informations de livraison</h2>
        
        <form @submit.prevent="validateDeliveryInfo" class="space-y-4">
          <div class="form-group">
            <label>Adresse de livraison</label>
            <input 
              v-model="deliveryInfo.address"
              type="text"
              class="form-input"
              required
            >
          </div>

          <div class="form-group">
            <label>Étage/Interphone</label>
            <input 
              v-model="deliveryInfo.details"
              type="text"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Instructions de livraison</label>
            <textarea 
              v-model="deliveryInfo.instructions"
              class="form-input"
              rows="3"
            ></textarea>
          </div>
        </form>
      </div>

      <!-- Récapitulatif et paiement -->
      <div class="order-summary bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-6">Récapitulatif de la commande</h2>
        
        <div class="space-y-4">
          <div v-for="item in cartItems" :key="item.id" class="flex justify-between">
            <span>{{ item.quantity }}x {{ item.name }}</span>
            <span>{{ (item.price * item.quantity).toFixed(2) }}€</span>
          </div>

          <div class="border-t pt-4 mt-4">
            <div class="flex justify-between mb-2">
              <span>Sous-total</span>
              <span>{{ subtotal.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>Frais de livraison</span>
              <span>{{ deliveryFee.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{{ total.toFixed(2) }}€</span>
            </div>
          </div>

          <div id="stripe-payment-element"></div>

          <button 
            @click="processPayment"
            :disabled="!isFormValid || processing"
            class="w-full bg-primary-500 text-white py-3 rounded-lg"
          >
            {{ processing ? 'Traitement...' : 'Payer et commander' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { loadStripe } from '@stripe/stripe-js'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const deliveryInfo = ref({
  address: '',
  details: '',
  instructions: ''
})

const processing = ref(false)
const stripe = ref(null)
const elements = ref(null)

const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const deliveryFee = computed(() => 2.99)
const total = computed(() => subtotal.value + deliveryFee.value)

const isFormValid = computed(() => {
  return deliveryInfo.value.address.length > 0
})

onMounted(async () => {
  stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  const response = await orderStore.createPaymentIntent(total.value)
  
  elements.value = stripe.value.elements({
    clientSecret: response.clientSecret
  })

  const paymentElement = elements.value.create('payment')
  paymentElement.mount('#stripe-payment-element')
})

const validateDeliveryInfo = () => {
  // Validation logique ici
  return isFormValid.value
}

const processPayment = async () => {
  if (!validateDeliveryInfo()) return

  processing.value = true

  try {
    const { error } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    // Créer la commande
    await orderStore.createOrder({
      items: cartItems.value,
      deliveryInfo: deliveryInfo.value,
      total: total.value
    })

    // Vider le panier
    cartStore.clearCart()

    // Rediriger vers la confirmation
    router.push('/order-confirmation')
  } catch (error) {
    console.error('Erreur de paiement:', error)
    // Gérer l'erreur
  } finally {
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-input {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.form-group {
  @apply space-y-2;
  label {
    @apply block text-sm font-medium text-gray-700;
  }
}
</style>
