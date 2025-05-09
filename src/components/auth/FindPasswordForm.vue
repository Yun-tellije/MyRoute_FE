<template>
  <div class="input-container container mt-5">
    <!-- 로고 -->
    <div class="logo-box">
      <img src="@/assets/img/logo.png" alt="로고" class="logo-img" />
    </div>

    <!-- 비밀번호 찾기 폼 -->
    <form @submit.prevent="submitReset">
      <div class="input-group-box mb-4">
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
        <button type="submit" class="btn btn-success">비밀번호 재설정</button>
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
  name: 'FindPasswordForm',
  data() {
    return {
      form: {
        email: '',
        code: '',
        newPassword: '',
      },
    }
  },
  methods: {
    async sendCode() {
      try {
        await axios.post('/api/auth/send-reset-code', { email: this.form.email })
        alert('인증번호가 이메일로 전송되었습니다.')
      } catch (err) {
        alert('이메일 전송 실패')
        console.error(err)
      }
    },
    async submitReset() {
      try {
        await axios.post('/api/auth/reset-password', {
          email: this.form.email,
          code: this.form.code,
          newPassword: this.form.newPassword,
        })
        alert('비밀번호가 재설정되었습니다. 로그인해주세요.')
        this.$router.push('/login')
      } catch (err) {
        alert('비밀번호 재설정 실패. 인증번호 또는 비밀번호를 확인해주세요.')
        console.error(err)
      }
    },
  },
}
</script>

<style scoped>
.input-container {
  max-width: 460px;
  margin: auto;
}

.logo-box {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.logo-img {
  width: 180px;
  margin-bottom: 60px;
  object-fit: contain;
}

.input-group-box {
  border: 1px solid #ced4da;
  border-radius: 6px;
  overflow: hidden;
}

.input-item {
  position: relative;
  height: 58px;
}

.input-item:not(:last-child) {
  border-bottom: 1px solid #eeeeee;
}

.custom-input {
  border: none;
  border-radius: 0;
  padding: 12px 15px;
}

.custom-input:focus {
  box-shadow: none;
  outline: none;
  background-color: #f8f9fa;
}

.custom-input::placeholder {
  color: #aaa;
}

.custom-input.with-button {
  padding-right: 110px;
}

/* 인증 버튼 */
.verify-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 10px;
  font-size: 0.9rem;
  background-color: #badbc8;
  border: none;
  color: #222222;
  z-index: 2;
}

/* 하단 버튼 */
.btn-success {
  background-color: #badbc8;
  color: #222222;
  border: none;
  height: 45px;
  margin-top: 10px;
  font-weight: 500;
}

.btn-success:hover {
  background-color: #aacab8;
  color: white;
}

/* 하단 링크 */
.extra-links {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
  color: #555;
}

.extra-links a {
  text-decoration: none;
  color: #555;
  margin: 0 5px;
}

.extra-links a:hover {
  text-decoration: underline;
}
</style>
