import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    token: null,
    userId: null,
    userName: null,
    userPhone: null,
    userEmail: null,
    userRole: null,
  }),
  actions: {
    login(token, userName, userRole) {
      this.token = token
      this.userName = userName
      this.userRole = userRole
      this.isLoggedIn = true
      localStorage.setItem('accessToken', token)
      localStorage.setItem('userName', userName)
      localStorage.setItem('userRole', userRole)
    },
    myInfo(userId, userName, userEmail, userPhone) {
      this.userId = userId
      this.userName = userName
      this.userEmail = userEmail
      this.userPhone = userPhone
      localStorage.setItem('userId', userId)
      localStorage.setItem('userName', userName)
      localStorage.setItem('userEmail', userEmail)
      localStorage.setItem('userPhone', userPhone)
    },
    logout() {
      this.token = null
      this.userId = null
      this.userName = null
      this.userPhone = null
      this.userEmail = null
      this.userRole = null
      this.isLoggedIn = false
      localStorage.clear()
    },
    restoreSession() {
      this.token = localStorage.getItem('accessToken')
      this.userName = localStorage.getItem('userName')
      this.userRole = localStorage.getItem('userRole')
      this.isLoggedIn = !!this.token
    },
  },
})
