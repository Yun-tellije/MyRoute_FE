<template>
  <div class="profile-info-container">
    <h2 class="section-title">내 정보</h2>
    <div class="form-container">
      <div class="form-row">
        <label class="form-label">아이디</label>
        <input type="text" class="form-input" v-model="userProfile.id" disabled />
      </div>
      <div class="form-row">
        <label class="form-label">이름</label>
        <input
          type="text"
          class="form-input"
          v-model="userProfile.name"
          placeholder="변경하실 이름 입력"
        />
      </div>
      <div class="form-row">
        <label class="form-label">전화번호</label>
        <input
          type="tel"
          class="form-input"
          v-model="userProfile.phone"
          placeholder="변경하실 전화번호 입력"
        />
      </div>
      <div class="form-row">
        <label class="form-label">이메일</label>
        <input
          type="email"
          class="form-input"
          v-model="userProfile.email"
          placeholder="변경하실 이메일 입력"
        />
      </div>

      <div class="button-group">
        <button class="btn btn-submit">저장</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'

export default {
  name: 'ProfileInfo',
  data() {
    return {
      userProfile: {
        id: '',
        name: '',
        phone: '',
        email: '',
      },
    }
  },
  created() {
    const store = useAuthStore()

    if (store.userId) {
      this.userProfile.id = store.userId
      this.userProfile.name = store.userName
      this.userProfile.email = store.userEmail
      this.userProfile.phone = store.userPhone
    }

    watch(
      () => [store.userId, store.userName, store.userEmail, store.userPhone],
      ([id, name, email, phone]) => {
        this.userProfile.id = id
        this.userProfile.name = name
        this.userProfile.email = email
        this.userProfile.phone = phone
      },
      { immediate: true },
    )
  },
  methods: {
    saveProfile() {
      console.log('프로필 저장:', this.userProfile)
    },
  },
}
</script>

<style scoped>
.profile-info-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 24px;
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
