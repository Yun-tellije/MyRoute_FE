<template>
  <div class="input-container container mt-5">
    <!-- 로고 -->
    <div class="logo-box">
      <img src="@/assets/img/logo.png" alt="로고" class="logo-name-img" />
    </div>

    <!-- 비밀번호 찾기 폼 -->
    <form @submit.prevent="submitReset">
      <div class="input-group-box mb-4">
        <div class="input-item last-input">
          <input
            v-model="form.id"
            type="text"
            class="form-control custom-input"
            placeholder="아이디"
            required
          />
        </div>
        <!-- 이메일 입력 -->
        <div class="input-item position-relative">
          <input
            v-model="form.email"
            type="email"
            class="form-control custom-input with-button"
            placeholder="이메일"
            required
          />
          <button type="button" class="verify-btn btn btn-outline-primary" @click="sendCode">
            인증번호 전송
          </button>
        </div>

        <!-- 인증번호 입력 -->
        <div class="input-item">
          <input
            v-model="form.code"
            type="text"
            class="form-control custom-input"
            placeholder="인증번호 입력"
            required
          />

          <button type="button" class="verify-btn btn btn-primary" @click="verifyEmailCode">
            인증번호 확인
          </button>
        </div>

        <!-- 새 비밀번호 입력 -->
        <div class="input-item last-input">
          <input
            v-model="form.newPassword"
            type="password"
            class="form-control custom-input"
            placeholder="새 비밀번호"
            required
          />
        </div>
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success" @click="changePassword">
          비밀번호 재설정
        </button>
      </div>

      <!-- 하단 링크 -->
      <div class="extra-links">
        <router-link to="/login">로그인</router-link>
        <span>|</span>
        <router-link to="/signup">회원가입</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PasswordResetView',
  data() {
    return {
      form: {
        id: '',
        email: '',
        code: '',
        newPassword: '',
      },
      isVerified: false,
    }
  },
  methods: {
    async sendCode() {
      if (!this.form.email) {
        alert('이메일을 입력해주세요.')
        return
      }

      try {
        await axios.post('/api/auth/send-code', {
          email: this.form.email,
        })
        alert('인증번호가 이메일로 전송되었습니다.')
      } catch (error) {
        alert('인증번호 전송 실패: ' + (error.response?.data?.message || error.message))
      }
    },

    async verifyEmailCode() {
      if (!this.form.code) {
        alert('인증번호를 입력해주세요.')
        return
      }

      try {
        await axios.post('/api/auth/verify-code', {
          email: this.form.email,
          code: this.form.code,
        })
        this.isVerified = true
        alert('이메일 인증 성공!')
      } catch (error) {
        alert('인증 실패: ' + (error.response?.data?.message || error.message))
      }
    },

    async changePassword() {
      if (!this.isVerified) {
        alert('이메일 인증을 먼저 완료해주세요.')
        return
      }

      if (!this.form.newPassword) {
        alert('새 비밀번호를 입력해주세요.')
        return
      }

      try {
        await axios.post('/api/auth/reset-password', {
          id: this.form.id,
          email: this.form.email,
          password: this.form.newPassword,
        })
        alert('비밀번호가 성공적으로 재설정되었습니다.')
        this.$router.push('/login')
      } catch (error) {
        alert('비밀번호 재설정 실패: ' + (error.response?.data?.message || error.message))
      }
    },
  },
}
</script>

<style src="@/assets/styles/common.css"></style>
