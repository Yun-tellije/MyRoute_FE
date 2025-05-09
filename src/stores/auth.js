import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    token: null,
    userId: null,
    userRole: null,
  }),
  actions: {
    login(token, userId, userRole) {
      this.token = token
      this.userId = userId
      this.userRole = userRole
      this.isLoggedIn = true
      localStorage.setItem('accessToken', token)
      localStorage.setItem('userId', userId)
      localStorage.setItem('userRole', userRole)
    },
    logout() {
      this.token = null
      this.userId = null
      this.userRole = null
      this.isLoggedIn = false
      localStorage.clear()
    },
    restoreSession() {
      this.token = localStorage.getItem('accessToken')
      this.userId = localStorage.getItem('userId')
      this.userRole = localStorage.getItem('userRole')
      this.isLoggedIn = !!this.token
    },
  },
})
