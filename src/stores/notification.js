import { defineStore } from 'pinia'
import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getFirestore 
} from 'firebase/firestore'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    fcmToken: null,
    loading: false,
    error: null
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      )
    }
  },

  actions: {
    async loadNotifications(userId) {
      try {
        this.loading = true
        const db = getFirestore()
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(50)
        )
        
        const snapshot = await getDocs(q)
        this.notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        }))
        
        this.unreadCount = this.notifications.filter(n => !n.read).length
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addNotification(notification) {
      try {
        const db = getFirestore()
        const docRef = await addDoc(collection(db, 'notifications'), {
          ...notification,
          timestamp: new Date()
        })
        
        this.notifications.unshift({
          id: docRef.id,
          ...notification
        })
        
        if (!notification.read) {
          this.unreadCount++
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async markAsRead(notificationId) {
      try {
        const db = getFirestore()
        await updateDoc(doc(db, 'notifications', notificationId), {
          read: true
        })
        
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification && !notification.read) {
          notification.read = true
          this.unreadCount--
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async markAllAsRead(userId) {
      try {
        const db = getFirestore()
        const batch = db.batch()
        
        const unreadNotifications = this.notifications.filter(n => !n.read)
        unreadNotifications.forEach(notification => {
          const notificationRef = doc(db, 'notifications', notification.id)
          batch.update(notificationRef, { read: true })
        })
        
        await batch.commit()
        
        this.notifications.forEach(n => n.read = true)
        this.unreadCount = 0
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteNotification(notificationId) {
      try {
        const db = getFirestore()
        await deleteDoc(doc(db, 'notifications', notificationId))
        
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          const notification = this.notifications[index]
          if (!notification.read) {
            this.unreadCount--
          }
          this.notifications.splice(index, 1)
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateFCMToken(token) {
      try {
        this.fcmToken = token
        // Mettre à jour le token dans la base de données utilisateur
        const db = getFirestore()
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          fcmToken: token
        })
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})
