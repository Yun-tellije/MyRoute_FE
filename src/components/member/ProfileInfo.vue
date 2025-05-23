<template>
  <div class="profile-info-container">
    <h2 class="section-title">내 정보</h2>
    <div class="form-container profile-flex-row">
      <div class="profile-image-col">
        <div class="profile-image-wrap">
          <img
            :src="userProfile.profileImage || defaultProfileImage"
            alt="프로필 이미지"
            class="profile-image"
          />
          <label class="btn-profile-upload">
            <i class="fa-solid fa-pen"></i>
            <input type="file" accept="image/*" @change="onImageChange" style="display: none" />
          </label>
        </div>
      </div>
      <div class="profile-info-fields">
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
          <button class="btn btn-submit" @click="updateProfile">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ProfileInfo',
  data() {
    return {
      userProfile: {
        id: '',
        name: '',
        phone: '',
        email: '',
        profileImage: '',
      },
      newProfileFile: null,
    }
  },
  async created() {
    try {
      const authStore = useAuthStore()

      const res = await axios.get('/api/members/me', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      const { memberInfo, profileImage } = res.data

      this.userProfile.id = memberInfo.id
      this.userProfile.name = memberInfo.name
      this.userProfile.email = memberInfo.email
      this.userProfile.phone = memberInfo.pnumber
      this.userProfile.profileImage = profileImage
    } catch (err) {
      console.error(err)
      alert('회원 정보를 불러오지 못했습니다.')
    }
  },
  methods: {
    async updateProfile() {
      try {
        const authStore = useAuthStore()

        const formData = new FormData()
        formData.append('name', this.userProfile.name)
        formData.append('email', this.userProfile.email)
        formData.append('pnumber', this.userProfile.phone)

        if (this.newProfileFile) {
          formData.append('profileImage', this.newProfileFile)
        }
        await axios.put('/api/members/me', formData, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        alert('프로필 정보가 저장되었습니다.')
        authStore.updateProfileImage(this.userProfile.profileImage)
        window.location.reload()
      } catch (err) {
        console.error(err)
        alert('프로필 정보 저장에 실패했습니다.')
      }
    },
    onImageChange(e) {
      const file = e.target.files[0]
      if (!file) return
      this.newProfileFile = file
      const reader = new FileReader()
      reader.onload = (ev) => {
        this.userProfile.profileImage = ev.target.result
      }
      reader.readAsDataURL(file)
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

.profile-flex-row {
  display: flex;
  align-items: flex-start;
  gap: 60px;
}

.profile-image-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
}

.profile-image-wrap {
  position: relative;
  display: inline-block;
  margin-left: 20px;
}

.profile-image {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e0e0e0;
  background: #f5f5f5;
  display: block;
}

.btn-profile-upload {
  position: absolute;
  right: 4px;
  bottom: 16px;
  background: #fff;
  color: #888;
  border-radius: 50%;
  padding: 8px 8px;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-profile-upload:hover {
  background: #ccc;
  color: #fff;
}

.profile-info-fields {
  flex: 1;
  min-width: 220px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-label {
  width: 90px;
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

.btn-submit {
  background-color: #9dbbaa;
  color: #fff;
}

@media (max-width: 700px) {
  .profile-flex-row {
    flex-direction: column;
    gap: 18px;
  }
  .profile-image-col {
    align-items: flex-start;
    min-width: 0;
  }
  .profile-info-fields {
    min-width: 0;
  }
}
</style>
