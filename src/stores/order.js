import { defineStore } from 'pinia'
import { 
  collection,
  addDoc,
  getDoc,
  updateDoc,
  getFirestore 
} from 'firebase/firestore'

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null,
    orderHistory: [],
    loading: false,
    error: null
  }),

  actions: {
    async createPaymentIntent(amount) {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount })
        })
        return await response.json()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async createOrder(orderData) {
      try {
        const db = getFirestore()
        const orderRef = await addDoc(collection(db, 'orders'), {
          ...orderData,
          status: 'pending',
          createdAt: new Date(),
          userId: auth.currentUser.uid
        })

        this.currentOrder = {
          id: orderRef.id,
          ...orderData
        }

        return this.currentOrder
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async getOrderStatus(orderId) {
      try {
        const db = getFirestore()
        const orderDoc = await getDoc(doc(db, 'orders', orderId))
        return orderDoc.data().status
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateOrderStatus(orderId, status) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'orders', orderId), {
          status: status
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})
