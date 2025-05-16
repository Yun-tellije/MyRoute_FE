import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    token: null,
    userName: null,
    userRole: null,
  }),
  actions: {
    login(token, userName, userRole) {
      this.isLoggedIn = true
      this.token = token
      this.userName = userName
      this.userRole = userRole
    },
    logout() {
      this.isLoggedIn = false
      this.token = null
      this.userName = null
      this.userRole = null
      localStorage.removeItem('pinia')
    },
    restoreSession() {
      this.isLoggedIn = !!this.token
    },
  },
  persist: true,
})
