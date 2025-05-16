<template>
  <div class="password-change-container">
    <h2 class="section-title">비밀번호</h2>
    <div class="form-container">
      <div class="form-row">
        <label class="form-label">현재 비밀번호</label>
        <input
          type="password"
          class="form-input"
          v-model="passwordData.currentPassword"
          placeholder="현재 비밀번호 입력"
        />
      </div>

      <div class="form-row">
        <label class="form-label">새 비밀번호</label>
        <input
          type="password"
          class="form-input"
          v-model="passwordData.newPassword"
          placeholder="새 비밀번호 작성"
        />
      </div>

      <div class="form-row">
        <label class="form-label">새 비밀번호 확인</label>
        <input
          type="password"
          class="form-input"
          v-model="passwordData.confirmPassword"
          placeholder="새 비밀번호 확인"
        />
      </div>

      <div class="button-group">
        <button class="btn btn-submit" @click="changePassword">저장</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'PasswordChange',
  data() {
    return {
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    }
  },
  methods: {
    async changePassword() {
      // 비밀번호 변경 로직
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('새 비밀번호와 확인이 일치하지 않습니다.')
        return
      }

      try {
        const authStore = useAuthStore()

        await axios.put(
          '/api/members/me/password',
          {
            currentPassword: this.passwordData.currentPassword,
            newPassword: this.passwordData.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        )

        alert('비밀번호가 성공적으로 변경되었습니다.')

        this.passwordData.currentPassword = ''
        this.passwordData.newPassword = ''
        this.passwordData.confirmPassword = ''
      } catch (error) {
        console.error('비밀번호 변경 실패:', error)
        alert('비밀번호 변경 중 오류가 발생했습니다.')
      }
    },
  },
}
</script>

<style scoped>
.password-change-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 24px;
  background-color: #fff;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 24px;
}

.form-container {
  width: 100%;
  padding-right: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-label {
  width: 150px;
  color: #888;
  font-size: 14px;
  text-align: right;
  padding-right: 20px;
}

.form-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border: 2px solid #2d2d2d;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-submit {
  background-color: #9dbbaa;
  color: #fff;
}
</style>
