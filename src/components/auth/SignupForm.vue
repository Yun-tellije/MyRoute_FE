<template>
  <div class="input-container container mt-5">
    <!-- 로고 이미지 -->
    <div class="logo-box">
      <img src="@/assets/img/logo.png" alt="로고" class="logo-name-img" />
    </div>
    <!-- 회원가입 폼 -->
    <form @submit.prevent="submitForm">
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

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorMessage = ref('')

// 회원가입 폼 데이터
const form = ref({
  id: '',
  password: '',
  name: '',
  email: '',
  phone: '',
})

const submitForm = async () => {
  try {
    await axios.post('/api/auth/signup', {
      id: form.value.id,
      password: form.value.password,
      name: form.value.name,
      email: form.value.email,
      pnumber: form.value.phone,
    })

    alert('회원가입이 완료되었습니다.')
    router.push('/login')
  } catch (err) {
    errorMessage.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
    console.error(err)
  }
}

// 인증번호 전송
const sendVerificationCode = () => {
  alert('구현 예정')
}

// 인증번호 확인
const verifyEmailCode = () => {
  alert('구현 예정')
}
</script>
<style src="@/assets/styles/common.css"></style>