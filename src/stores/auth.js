import { defineStore } from 'pinia'
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async login(email, password) {
      try {
        const auth = getAuth()
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        this.user = user
      } catch (error) {
        this.error = error.message
      }
    },

    async register(email, password) {
      try {
        const auth = getAuth()
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        this.user = user
      } catch (error) {
        this.error = error.message
      }
    },

    async logout() {
      try {
        const auth = getAuth()
        await signOut(auth)
        this.user = null
      } catch (error) {
        this.error = error.message
      }
    }
  }
})
