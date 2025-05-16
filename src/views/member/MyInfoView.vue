<template>
  <div class="my-page-container">
    <h1 class="page-title">마이페이지</h1>
    <ProfileInfoForm />
    <PasswordChangeForm />
  </div>
</template>

<script setup>
import PasswordChangeForm from '@/components/member/PasswordChange.vue'
import ProfileInfoForm from '@/components/member/ProfileInfo.vue'
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
