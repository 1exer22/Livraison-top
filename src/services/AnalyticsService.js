import { initializeApp } from 'firebase/app'
import { 
  getAnalytics,
  logEvent,
  setUserProperties 
} from 'firebase/analytics'

class AnalyticsService {
  constructor() {
    this.analytics = null
    this.sessionId = null
    this.initialized = false
  }

  async initialize() {
    try {
      this.analytics = getAnalytics()
      this.sessionId = this.generateSessionId()
      this.initialized = true
      
      // Démarrer le tracking de session
      this.trackSession()
    } catch (error) {
      console.error('Erreur d\'initialisation analytics:', error)
      throw error
    }
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  setUser(user) {
    if (!this.initialized) return

    setUserProperties(this.analytics, {
      userId: user.id,
      userType: user.type,
      userZone: user.zone
    })
  }

  trackEvent(eventName, params = {}) {
    if (!this.initialized) return

    logEvent(this.analytics, eventName, {
      ...params,
      sessionId: this.sessionId,
      timestamp: Date.now()
    })
  }

  trackSession() {
    if (!this.initialized) return

    // Tracking de la durée de session
    this.sessionStartTime = Date.now()
    
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionStartTime
      this.trackEvent('session_end', { duration: sessionDuration })
    })
  }

  // Événements spécifiques
  trackPageView(page) {
    this.trackEvent('page_view', {
      page_title: page.title,
      page_path: page.path
    })
  }

  trackSearch(query, results) {
    this.trackEvent('search', {
      search_term: query,
      results_count: results.length
    })
  }

  trackOrder(order) {
    this.trackEvent('order_placed', {
      orderId: order.id,
      restaurantId: order.restaurantId,
      amount: order.total,
      items: order.items.length
    })
  }

  trackRestaurantInteraction(restaurantId, action) {
    this.trackEvent('restaurant_interaction', {
      restaurantId,
      action
    })
  }

  async getAnalytics(params) {
    try {
      const response = await fetch('/api/analytics/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur de récupération des analytics:', error)
      throw error
    }
  }

  async getPredictions(params) {
    try {
      const response = await fetch('/api/analytics/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur de récupération des prédictions:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()
