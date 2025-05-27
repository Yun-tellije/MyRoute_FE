<template>
  <div class="notice-detail-container">
    <div class="notice-header-box">
      <div class="notice-meta-row">
        <span class="notice-title">{{ title }}</span>
      </div>
      <div class="notice-info-row">
        <img :src="profileImage" alt="프로필 이미지" class="profile-image" />
        <span class="notice-writer">{{ memberName }}</span>
        <span class="notice-date">{{ formatDate(createAt) }}</span>
      </div>
    </div>
    <hr class="notice-divider" />
    <div class="notice-content" v-html="content"></div>

    <div class="notice-buttons">
      <div v-if="isAdmin" class="admin-buttons">
        <router-link :to="`/notices/edit/${noticeId}`" class="btn-edit">수정</router-link>
        <button class="btn-delete" @click="deleteNotice">삭제</button>
      </div>
      <router-link to="/notices" class="btn-back"> 목록으로 돌아가기 </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NoticeDetailView',
  data() {
    return {
      noticeId: null,
      title: null,
      content: null,
      memberName: null,
      createAt: null,
      profileImage: null,
    }
  },
  computed: {
    isAdmin() {
      return useAuthStore().userRole === 'ADMIN'
    },
  },
  async created() {
    const noticeRequestId = this.$route.params.noticeId

    try {
      const res = await axios.get(`/api/notices/${noticeRequestId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
      })
      const { noticeId, title, content, memberName, createAt, profileImage } = res.data

      console.log('공지사항 상세 정보:', res.data)

      this.noticeId = noticeId
      this.title = title
      this.content = content
      this.memberName = memberName
      this.createAt = createAt
      this.profileImage = profileImage
    } catch (err) {
      console.error('공지사항 상세 불러오기 실패:', err)
    }
  },
  methods: {
    formatDate(dateStr) {
      const d = new Date(dateStr)
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    },
    async deleteNotice() {
      if (!confirm('정말로 삭제하시겠습니까?')) return

      try {
        await axios.delete(`/api/notices/${this.notice.noticeId}`, {
          headers: {
            Authorization: `Bearer ${useAuthStore().token}`,
          },
        })
        alert('공지사항이 삭제되었습니다.')
        this.$router.push('/notices')
      } catch (err) {
        console.error('공지사항 삭제 실패:', err)
        useAuthStore().logout()
        alert('삭제에 실패했습니다.')
      }
    },
  },
}
</script>

<style scoped>
.notice-detail-container {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 32px 32px;
}

.notice-header-box {
  border-top: 2px solid #696969;
  padding-top: 20px;
  margin-bottom: 12px;
}

.notice-meta-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 8px;
}

.notice-title {
  font-size: 26px;
  font-weight: 400;
  color: #222;
  letter-spacing: -1px;
}

.notice-info-row {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #888;
  font-size: 1rem;
}

.profile-image {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.notice-writer {
  font-size: 1rem;
  padding-right: 12px;
  border-right: 1.5px solid #d0d0d0;
}

.notice-date {
  font-size: 1rem;
}
.notice-divider {
  border: none;
  border-top: 1px solid #d0d0d0;
  margin: 18px 0 28px 0;
}

.notice-content {
  margin-bottom: 36px;
  padding-bottom: 60px;
  font-size: 1.08rem;
  color: #222;
  line-height: 1.7;
  min-height: 360px;
  border-bottom: 2px solid #e0e0e0;
}

.admin-buttons {
  display: flex;
  gap: 14px;
  margin-right: 50px;
}
.btn-edit {
  background-color: #696969;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  text-decoration: none;
}
.btn-delete {
  background-color: #fff;
  padding: 6px 14px;
  color: #696969;
  border: 1px solid #999999;
  border-radius: 4px;
  cursor: pointer;
}
.btn-back {
  display: inline-block;
  color: #696969;
  border: 1px solid #999999;
  padding: 6px 10px;
  border-radius: 4px;
  text-decoration: none;
}

.notice-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
}

@media (max-width: 700px) {
  .notice-detail-container {
    padding: 18px 4px;
  }
  .notice-title {
    font-size: 1.05rem;
  }
}
</style>
