<template>
  <div class="payment-methods">
    <div class="space-y-4">
      <div 
        v-for="method in paymentMethods"
        :key="method.id"
        class="payment-method-card"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img 
              :src="getCardBrandIcon(method.brand)"
              :alt="method.brand"
              class="h-8 w-8 mr-3"
            >
            <div>
              <div class="flex items-center">
                <span class="font-medium">•••• {{ method.last4 }}</span>
                <span 
                  v-if="method.isDefault"
                  class="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Par défaut
                </span>
              </div>
              <div class="text-sm text-gray-600">
                Expire {{ method.expMonth }}/{{ method.expYear }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              v-if="!method.isDefault"
              @click="setAsDefault(method.id)"
              class="text-primary-600 hover:text-primary-800"
            >
              Définir par défaut
            </button>
            <button 
              @click="deleteMethod(method.id)"
              class="text-red-600 hover:text-red-800"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucun moyen de paiement -->
      <div 
        v-if="paymentMethods.length === 0"
        class="text-center text-gray-500 py-4"
      >
        Aucun moyen de paiement enregistré
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'

const paymentStore = usePaymentStore()

const paymentMethods = computed(() => paymentStore.paymentMethods)

const getCardBrandIcon = (brand) => {
  const icons = {
    visa: '/card-icons/visa.png',
    mastercard: '/card-icons/mastercard.png',
    amex: '/card-icons/amex.png',
    // Ajouter d'autres marques de carte si nécessaire
  }
  return icons[brand.toLowerCase()] || '/card-icons/generic.png'
}

const setAsDefault = async (methodId) => {
  try {
    await paymentStore.setDefaultPaymentMethod(methodId)
  } catch (error) {
    console.error('Erreur lors de la définition par défaut:', error)
  }
}

const deleteMethod = async (methodId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) {
    try {
      await paymentStore.deletePaymentMethod(methodId)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-method-card {
  @apply bg-white p-4 rounded-lg border hover:shadow-md transition-shadow duration-200;
}
</style>
