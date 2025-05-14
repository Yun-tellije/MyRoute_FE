<template>
  <div class="my-page-container">
    <h1 class="page-title">마이페이지</h1>
    <ProfileInfoForm />
    <PasswordChangeForm />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import axios from 'axios'
import PasswordChangeForm from '@/components/member/PasswordChange.vue'
import ProfileInfoForm from '@/components/member/ProfileInfo.vue'
import { useAuthStore } from '@/stores/auth'

onMounted(async () => {
  try {
    const res = await axios.get('/api/members/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    const authStore = useAuthStore()
    const { id, name, email, pnumber } = res.data
    console.log('사용자 정보:', res.data)
    authStore.myInfo(id, name, email, pnumber)
  } catch (err) {
    console.error('사용자 정보 불러오기 실패:', err)
  }
})
</script>

<style scoped>
.my-page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #888;
}
</style>
