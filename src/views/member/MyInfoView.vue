<template>
  <div class="my-page-container">
    <h1 class="page-title">마이페이지</h1>
    <ProfileInfoForm />
    <PasswordChangeForm />
    <div class="withdraw-btn-wrapper">
      <button class="withdraw-btn" @click="handleWithdraw" :disabled="loading">
        {{ loading ? '처리 중...' : '회원 탈퇴' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import PasswordChangeForm from '@/components/member/PasswordChange.vue'
import ProfileInfoForm from '@/components/member/ProfileInfo.vue'
import { useAuthStore } from '@/stores/auth' // authStore import

const loading = ref(false)
const authStore = useAuthStore() // authStore 사용

const handleWithdraw = async () => {
  if (!confirm('정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
  loading.value = true
  try {
    await axios.delete('/api/members/me', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    alert('회원 탈퇴가 완료되었습니다.')
    authStore.logout()
    window.location.href = '/'
  } catch {
    alert('회원 탈퇴에 실패했습니다.')
    authStore.logout()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.my-page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 500;
  color: #333;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #888;
}

.withdraw-btn-wrapper {
  display: flex;
  justify-content: flex-end;
}

.withdraw-btn {
  margin-top: 40px;
  background: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.withdraw-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
