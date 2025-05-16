<template>
  <div class="input-container container mt-5">
    <div class="logo-box">
      <img src="@/assets/img/logo.png" alt="로고" class="logo-name-img" />
    </div>

    <form @submit.prevent="submitLogin">
      <div class="input-group-box mb-4">
        <div class="input-item">
          <input
            v-model="loginForm.id"
            type="text"
            class="form-control custom-input"
            placeholder="아이디"
            required
          />
        </div>
        <div class="input-item last-input">
          <input
            v-model="loginForm.password"
            type="password"
            class="form-control custom-input"
            placeholder="비밀번호"
            required
          />
        </div>
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success">로그인</button>
      </div>

      <div class="extra-links">
        <router-link to="/find-password">비밀번호 찾기</router-link>
        <span>|</span>
        <router-link to="/signup">회원가입</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginForm',
  data() {
    return {
      loginForm: {
        id: '',
        password: '',
      },
    }
  },
  methods: {
    async submitLogin() {
      try {
        const response = await axios.post('/api/auth/login', this.loginForm)
        const { token, name, role } = response.data

        if (token) {
          const authStore = useAuthStore()
          authStore.login(token, name, role)

          alert('로그인 성공!')
          this.$router.push('/')
        } else {
          alert('로그인 실패')
        }
      } catch (err) {
        alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.')
        console.error(err)
      }
    },
  },
}
</script>

<style src="@/assets/styles/common.css"></style>
