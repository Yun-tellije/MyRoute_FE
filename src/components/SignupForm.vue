<template>
  <div class="signup-container container mt-5">
    <!-- 로고 이미지 -->
    <div class="logo-box">
      <img src="@/assets/logo.png" alt="로고" class="logo-img" />
    </div>

    <!-- 회원가입 폼 -->
    <form @submit.prevent="submitForm">
      <!-- 아이디~인증번호 묶음 -->
      <div class="input-group-box mb-4">
        <div class="input-item">
          <input
            v-model="form.id"
            type="text"
            class="form-control custom-input"
            placeholder="아이디"
            required
          />
        </div>
        <div class="input-item">
          <input
            v-model="form.password"
            type="password"
            class="form-control custom-input"
            placeholder="비밀번호"
            required
          />
        </div>
        <div class="input-item position-relative">
          <input
            v-model="form.email"
            type="email"
            class="form-control custom-input with-button"
            placeholder="이메일"
            required
          />
          <button type="button" class="verify-btn btn btn-primary" @click="sendVerificationCode">
            인증번호 전송
          </button>
        </div>
        <div class="input-item position-relative">
          <input
            v-model="form.verificationCode"
            type="text"
            class="form-control custom-input with-button"
            placeholder="인증번호 입력"
          />
          <button type="button" class="verify-btn btn btn-primary" @click="verifyEmailCode">
            인증번호 확인
          </button>
        </div>
      </div>

      <!-- 이름~전화번호 묶음 -->
      <div class="input-group-box mb-4">
        <div class="input-item">
          <input
            v-model="form.name"
            type="text"
            class="form-control custom-input"
            placeholder="이름"
            required
          />
        </div>
        <div class="input-item last-input">
          <input
            v-model="form.phone"
            type="tel"
            class="form-control custom-input"
            placeholder="휴대전화번호"
            required
          />
        </div>
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success">회원가입</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SignupForm',
  data() {
    return {
      form: {
        id: '',
        password: '',
        email: '',
        verificationCode: '',
        name: '',
        phone: '',
      },
      emailVerified: false,
    }
  },
  methods: {
    async sendVerificationCode() {
      try {
        const response = await axios.post('/api/auth/send-code', { email: this.form.email })
        alert('인증번호가 이메일로 전송되었습니다.')
        console.log(response.data)
      } catch (err) {
        alert('인증번호 전송 실패')
        console.error(err)
      }
    },

    async verifyEmailCode() {
      try {
        const response = await axios.post('/api/auth/verify-code', {
          email: this.form.email,
          code: this.form.verificationCode,
        })
        if (response.data.verified) {
          this.emailVerified = true
          alert('이메일 인증 성공')
        } else {
          alert('인증번호가 일치하지 않습니다.')
        }
      } catch (err) {
        alert('인증 확인 실패')
        console.error(err)
      }
    },

    async submitForm() {
      if (!this.emailVerified) {
        alert('이메일 인증을 먼저 완료해주세요.')
        return
      }

      try {
        const response = await axios.post('/api/members', this.form)
        alert('회원가입이 완료되었습니다.')
        console.log(response.data)
      } catch (err) {
        alert('회원가입 실패')
        console.error(err)
      }
    },
  },
}
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: auto;
}

/* 로고 */
.logo-box {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.logo-img {
  /* max-height: 60px; */
  width: 150px;
  object-fit: contain;
}

/* 인풋 스타일링 */
.input-group-box {
  border: 1px solid #ced4da;
  border-radius: 6px;
  overflow: hidden;
}

.input-item {
  position: relative;
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

.custom-input.with-button {
  padding-right: 110px;
}

/* placeholder */
.custom-input::placeholder {
  color: #aaa;
}

/* 인증버튼 */
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

.verify-btn:hover {
  background-color: #aacab8;
  color: white;
}

/* 가입버튼 */
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
</style>
