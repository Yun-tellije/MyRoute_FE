import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    token: null,
    userName: null,
    userRole: null,
    profileImage: null,
  }),
  actions: {
    login(token, userName, userRole, profileImage) {
      this.isLoggedIn = true
      this.token = token
      this.userName = userName
      this.userRole = userRole
      this.profileImage = profileImage
    },
    logout() {
      this.$reset()
    },
    updateProfileImage(newImage) {
      this.profileImage = newImage
    },
  },
  persist: true,
})
