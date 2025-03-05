import { defineStore } from "pinia";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";

export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    restaurant: null,
    orders: [],
    stats: null,
    notifications: [],
    loading: false,
    error: null,
  }),

  actions: {
    async getRestaurantData() {
      try {
        const db = getFirestore();
        const restaurantDoc = await getDoc(
          doc(db, "restaurants", this.restaurant.id)
        );
        return restaurantDoc.data();
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async updateStatus(status) {
      try {
        const db = getFirestore();
        await updateDoc(doc(db, "restaurants", this.restaurant.id), {
          isOpen: status,
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async getActiveOrders() {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "orders"),
          where("restaurantId", "==", this.restaurant.id),
          where("status", "in", ["pending", "accepted", "preparing"])
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async updateOrderStatus(orderId, status) {
      try {
        const db = getFirestore();
        await updateDoc(doc(db, "orders", orderId), {
          status: status,
          updatedAt: new Date(),
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async getDashboardStats() {
      try {
        const db = getFirestore();
        // Logique pour calculer les statistiques
        return {
          todayOrders: 0,
          todayRevenue: 0,
          avgPrepTime: 0,
          rating: 0,
        };
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async getNotifications() {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "notifications"),
          where("restaurantId", "==", this.restaurant.id),
          where("read", "==", false)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    subscribeToOrders() {
      const db = getFirestore();
      const q = query(
        collection(db, "orders"),
        where("restaurantId", "==", this.restaurant.id),
        where("status", "in", ["pending", "accepted", "preparing"])
      );

      return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            // Nouvelle commande
            this.notifications.push({
              type: "new_order",
              orderId: change.doc.id,
              timestamp: new Date(),
            });
          }
        });
      });
    },
  },
});
