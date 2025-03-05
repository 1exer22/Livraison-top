import { initializeApp } from 'firebase/app'
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from 'firebase/messaging'
import { useNotificationStore } from '@/stores/notification'

class NotificationService {
  constructor() {
    this.messaging = null
    this.notificationStore = useNotificationStore()
  }

  async initialize() {
    try {
      // Initialiser Firebase Messaging
      this.messaging = getMessaging()
      
      // Demander la permission pour les notifications
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Obtenir le token FCM
        const token = await getToken(this.messaging)
        await this.notificationStore.updateFCMToken(token)
      }

      // Écouter les messages en premier plan
      onMessage(this.messaging, (payload) => {
        this.handleForegroundMessage(payload)
      })
    } catch (error) {
      console.error('Erreur d\'initialisation des notifications:', error)
    }
  }

  async handleForegroundMessage(payload) {
    const notification = {
      id: Date.now(),
      title: payload.notification.title,
      body: payload.notification.body,
      type: payload.data.type,
      data: payload.data,
      timestamp: new Date(),
      read: false
    }

    await this.notificationStore.addNotification(notification)
    this.showNotification(notification)
  }

  showNotification(notification) {
    // Afficher la notification dans l'interface
    const event = new CustomEvent('show-notification', {
      detail: notification
    })
    window.dispatchEvent(event)
  }

  async sendPushNotification(userId, notification) {
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          notification
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur d\'envoi de notification push:', error)
      throw error
    }
  }

  async sendEmail(userId, template, data) {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          template,
          data
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur d\'envoi d\'email:', error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()
