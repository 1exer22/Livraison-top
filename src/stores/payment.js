import { defineStore } from 'pinia'
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getFirestore 
} from 'firebase/firestore'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    paymentMethods: [],
    transactions: [],
    loading: false,
    error: null
  }),

  getters: {
    defaultPaymentMethod: (state) => {
      return state.paymentMethods.find(pm => pm.isDefault)
    },
    
    sortedTransactions: (state) => {
      return [...state.transactions].sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      )
    }
  },

  actions: {
    async loadPaymentMethods(userId) {
      try {
        this.loading = true
        const db = getFirestore()
        const q = query(
          collection(db, 'payment_methods'),
          where('userId', '==', userId)
        )
        
        const snapshot = await getDocs(q)
        this.paymentMethods = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addPaymentMethod(paymentMethod) {
      try {
        const db = getFirestore()
        const docRef = await addDoc(collection(db, 'payment_methods'), {
          ...paymentMethod,
          createdAt: new Date()
        })
        
        this.paymentMethods.push({
          id: docRef.id,
          ...paymentMethod
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async setDefaultPaymentMethod(paymentMethodId) {
      try {
        const db = getFirestore()
        const batch = db.batch()

        // Mettre à jour l'ancien moyen de paiement par défaut
        const oldDefault = this.paymentMethods.find(pm => pm.isDefault)
        if (oldDefault) {
          const oldRef = doc(db, 'payment_methods', oldDefault.id)
          batch.update(oldRef, { isDefault: false })
        }

        // Définir le nouveau moyen de paiement par défaut
        const newRef = doc(db, 'payment_methods', paymentMethodId)
        batch.update(newRef, { isDefault: true })

        await batch.commit()

        // Mettre à jour le state
        this.paymentMethods = this.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        }))
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deletePaymentMethod(paymentMethodId) {
      try {
        const db = getFirestore()
        await deleteDoc(doc(db, 'payment_methods', paymentMethodId))
        
        this.paymentMethods = this.paymentMethods.filter(
          pm => pm.id !== paymentMethodId
        )
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async loadTransactions(userId) {
      try {
        this.loading = true
        const db = getFirestore()
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', userId)
        )
        
        const snapshot = await getDocs(q)
        this.transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        }))
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async recordTransaction(transaction) {
      try {
        const db = getFirestore()
        const docRef = await addDoc(collection(db, 'transactions'), {
          ...transaction,
          timestamp: new Date()
        })
        
        this.transactions.unshift({
          id: docRef.id,
          ...transaction,
          timestamp: new Date()
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})
