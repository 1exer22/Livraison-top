import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0
  }),

  actions: {
    addItem(item) {
      this.items.push(item)
      this.calculateTotal()
    },

    removeItem(itemId) {
      this.items = this.items.filter(item => item.id !== itemId)
      this.calculateTotal()
    },

    calculateTotal() {
      this.total = this.items.reduce((sum, item) => sum + item.price, 0)
    },

    clearCart() {
      this.items = []
      this.total = 0
    }
  }
})
