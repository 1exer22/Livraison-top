import { defineStore } from 'pinia'
import { analyticsService } from '@/services/AnalyticsService'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    insights: null,
    predictions: null,
    trends: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchInsights(params) {
      try {
        this.loading = true
        const data = await analyticsService.getAnalytics(params)
        this.insights = data
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPredictions(params) {
      try {
        this.loading = true
        const data = await analyticsService.getPredictions(params)
        this.predictions = data
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async analyzeTrends(params) {
      try {
        this.loading = true
        const response = await fetch('/api/analytics/trends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        const data = await response.json()
        this.trends = data
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
