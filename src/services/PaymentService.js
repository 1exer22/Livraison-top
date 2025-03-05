import { loadStripe } from '@stripe/stripe-js'
import { usePaymentStore } from '@/stores/payment'

class PaymentService {
  constructor() {
    this.stripe = null
    this.paymentStore = usePaymentStore()
  }

  async initialize() {
    try {
      this.stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    } catch (error) {
      console.error('Erreur d\'initialisation Stripe:', error)
      throw error
    }
  }

  async createPaymentIntent(amount, currency = 'EUR') {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          currency
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur de création du payment intent:', error)
      throw error
    }
  }

  async processPayment(paymentMethodId, amount) {
    try {
      const paymentIntent = await this.createPaymentIntent(amount)
      
      const { error } = await this.stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: paymentMethodId
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      return paymentIntent
    } catch (error) {
      console.error('Erreur de traitement du paiement:', error)
      throw error
    }
  }

  async savePaymentMethod(paymentMethod) {
    try {
      await this.paymentStore.addPaymentMethod(paymentMethod)
    } catch (error) {
      console.error('Erreur d\'enregistrement du moyen de paiement:', error)
      throw error
    }
  }

  async processRestaurantPayout(restaurantId, amount) {
    try {
      const response = await fetch('/api/payments/restaurant-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId,
          amount
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur de paiement au restaurant:', error)
      throw error
    }
  }

  calculateCommission(orderAmount) {
    // Logique de calcul des commissions
    const platformFee = orderAmount * 0.15 // 15% de commission plateforme
    const deliveryFee = 2.99 // Frais de livraison fixes
    return {
      platformFee,
      deliveryFee,
      total: platformFee + deliveryFee
    }
  }
}

export const paymentService = new PaymentService()
