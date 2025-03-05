import { defineStore } from "pinia";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getFirestore,
} from "firebase/firestore";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    stats: null,
    alerts: [],
    loading: false,
    error: null,
  }),

  actions: {
    async getDashboardStats() {
      try {
        const db = getFirestore();
        // Logique pour récupérer les statistiques globales
        return {
          todayOrders: 0,
          revenue: 0,
          newUsers: 0,
          activeRestaurants: 0,
          ordersTrend: "+0%",
          revenueTrend: "+0%",
          usersTrend: "+0%",
          restaurantsTrend: "+0%",
        };
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async getRecentOrders() {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "orders"),
          where("createdAt", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000))
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

    async getSystemAlerts() {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "system_alerts"),
          where("resolved", "==", false)
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

    async resolveAlert(alertId) {
      try {
        const db = getFirestore();
        await updateDoc(doc(db, "system_alerts", alertId), {
          resolved: true,
          resolvedAt: new Date(),
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async markAllAlertsRead() {
      try {
        const db = getFirestore();
        const batch = db.batch();
        const alerts = await this.getSystemAlerts();

        alerts.forEach((alert) => {
          const alertRef = doc(db, "system_alerts", alert.id);
          batch.update(alertRef, { read: true });
        });

        await batch.commit();
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async getSalesData() {
      try {
        const db = getFirestore();
        // Logique pour récupérer les données de vente
        return [];
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async getTopRestaurants() {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "restaurants"),
          where("active", "==", true)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },
  },
});
