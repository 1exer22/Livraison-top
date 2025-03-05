import { defineStore } from 'pinia'
import { 
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
  getFirestore 
} from 'firebase/firestore'

export const useDriverStore = defineStore('driver', {
  state: () => ({
    driver: null,
    currentDelivery: null,
    availableDeliveries: [],
    stats: null,
    loading: false,
    error: null
  }),

  actions: {
    async getDriverData() {
      try {
        const db = getFirestore()
        const driverDoc = await getDoc(doc(db, 'drivers', this.driver.id))
        return driverDoc.data()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateAvailability(status) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'drivers', this.driver.id), {
          isAvailable: status,
          lastStatusUpdate: new Date()
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateLocation(location) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'drivers', this.driver.id), {
          currentLocation: location,
          lastLocationUpdate: new Date()
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async getAvailableDeliveries() {
      try {
        const db = getFirestore()
        const q = query(
          collection(db, 'deliveries'),
          where('status', '==', 'pending'),
          where('assignedDriver', '==', null)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async acceptDelivery(deliveryId) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'deliveries', deliveryId), {
          status: 'accepted',
          assignedDriver: this.driver.id,
          acceptedAt: new Date()
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateDeliveryStatus(deliveryId, status) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'deliveries', deliveryId), {
          status,
          [`statusHistory.${status}`]: new Date()
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async completeDelivery(deliveryId) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'deliveries', deliveryId), {
          status: 'completed',
          completedAt: new Date()
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async getTodayStats() {
      try {
        const db = getFirestore()
        // Logique pour calculer les statistiques journalières
        return {
          deliveryCount: 0,
          earnings: 0,
          totalDistance: 0,
          activeTime: 0
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async getCurrentDelivery() {
      try {
        const db = getFirestore()
        const q = query(
          collection(db, 'deliveries'),
          where('assignedDriver', '==', this.driver.id),
          where('status', 'in', ['accepted', 'picked_up', 'delivering'])
        )
        const snapshot = await getDocs(q)
        return snapshot.docs[0]?.data() || null
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})
</script>
