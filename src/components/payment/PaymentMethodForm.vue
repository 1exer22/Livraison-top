<template>
  <div class="payment-method-form">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- Numéro de carte -->
        <div class="form-group">
          <label>Numéro de carte</label>
          <div id="card-number" class="stripe-element"></div>
          <span v-if="errors.cardNumber" class="error-message">
            {{ errors.cardNumber }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Date d'expiration -->
          <div class="form-group">
            <label>Date d'expiration</label>
            <div id="card-expiry" class="stripe-element"></div>
            <span v-if="errors.cardExpiry" class="error-message">
              {{ errors.cardExpiry }}
            </span>
          </div>

          <!-- CVC -->
          <div class="form-group">
            <label>Code de sécurité (CVC)</label>
            <div id="card-cvc" class="stripe-element"></div>
            <span v-if="errors.cardCvc" class="error-message">
              {{ errors.cardCvc }}
            </span>
          </div>
        </div>

        <!-- Nom sur la carte -->
        <div class="form-group">
          <label>Nom sur la carte</label>
          <input 
            v-model="cardName"
            type="text"
            class="form-input"
            required
          >
        </div>

        <!-- Case à cocher pour définir comme moyen de paiement par défaut -->
        <div class="flex items-center">
          <input
            v-model="setAsDefault"
            type="checkbox"
            id="default-payment"
            class="form-checkbox"
          >
          <label for="default-payment" class="ml-2">
            Définir comme moyen de paiement par défaut
          </label>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="btn-primary w-full"
        >
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin mr-2"></i>Traitement...
          </span>
          <span v-else>
            Ajouter la carte
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { paymentService } from '@/services/PaymentService'

const paymentStore = usePaymentStore()

const emit = defineEmits(['success', 'error'])

// États
const cardName = ref('')
const setAsDefault = ref(false)
const loading = ref(false)
const errors = ref({})
const elements = ref(null)
const card = ref(null)

// Initialisation des éléments Stripe
onMounted(async () => {
  try {
    await paymentService.initialize()
    
    elements.value = paymentService.stripe.elements()
    
    // Créer les éléments de carte
    const style = {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }

    card.value = elements.value.create('card', { style })
    card.value.mount('#card-number')
    
    // Écouter les erreurs
    card.value.addEventListener('change', handleCardChange)
  } catch (error) {
    console.error('Erreur d\'initialisation du formulaire:', error)
    emit('error', error)
  }
})

onUnmounted(() => {
  if (card.value) {
    card.value.removeEventListener('change', handleCardChange)
    card.value.destroy()
  }
})

// Gestionnaire de changement de carte
const handleCardChange = (event) => {
  if (event.error) {
    errors.value.card = event.error.message
  } else {
    errors.value.card = null
  }
}

// Soumission du formulaire
const handleSubmit = async () => {
  try {
    loading.value = true
    errors.value = {}

    const { token, error } = await paymentService.stripe.createToken(card.value, {
      name: cardName.value
    })

    if (error) {
      throw new Error(error.message)
    }

    // Enregistrer le moyen de paiement
    await paymentStore.addPaymentMethod({
      token: token.id,
      last4: token.card.last4,
      brand: token.card.brand,
      expMonth: token.card.exp_month,
      expYear: token.card.exp_year,
      name: cardName.value,
      isDefault: setAsDefault.value
    })

    emit('success')
  } catch (error) {
    console.error('Erreur d\'ajout de la carte:', error)
    errors.value.submit = error.message
    emit('error', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.stripe-element {
  @apply w-full px-4 py-2 border rounded-lg bg-white;
}

.form-input {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.form-checkbox {
  @apply h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded;
}

.error-message {
  @apply text-sm text-red-600 mt-1;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600
         disabled:opacity-50 disabled:cursor-not-allowed
         flex items-center justify-center transition-colors duration-200;
}
</style>
