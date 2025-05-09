<template>
  <div class="input-container container mt-5">
    <!-- 로고 -->
    <div class="logo-box">
      <img src="@/assets/img/logo.png" alt="로고" class="logo-img" />
    </div>

    <!-- 로그인 폼 -->
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

      <!-- 하단 링크 -->
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
        const { token } = response.data

        if (token) {
          localStorage.setItem('accessToken', token)
          alert('로그인 성공!')
          this.$router.push('/')
        } else {
          alert('로그인 실패: 토큰 없음')
        }
      } catch (err) {
        alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.')
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
