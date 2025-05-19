<template>
  <div class="notice-detail-container" v-if="notice">
    <h1>{{ notice.title }}</h1>
    <p class="date">{{ formatDate(notice.createdAt) }}</p>
    <div class="content" v-html="notice.content"></div>

    <div v-if="isAdmin" class="admin-buttons">
      <router-link :to="`/notices/edit/${notice.noticeId}`" class="btn-edit">수정</router-link>
      <button class="btn-delete" @click="deleteNotice">삭제</button>
    </div>

    <router-link to="/notices" class="btn-back">← 목록으로 돌아가기</router-link>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NoticeDetailView',
  data() {
    return {
      notice: null,
    }
  },
  computed: {
    isAdmin() {
      return useAuthStore().userRole === 'ADMIN'
    },
  },
  async created() {
    const noticeId = this.$route.params.noticeId

    try {
      const res = await axios.get(`/api/notices/${noticeId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`,
        },
      })
      this.notice = res.data
    } catch (err) {
      console.error('공지사항 상세 불러오기 실패:', err)
    }
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('ko-KR')
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
        alert('삭제에 실패했습니다.')
      }
    },
  },
}
</script>

<style scoped>
.notice-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.date {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
}
.content {
  white-space: pre-wrap;
  margin-bottom: 30px;
}
.btn-back {
  display: inline-block;
  background-color: #9dbbaa;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
}
.admin-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.btn-edit {
  background-color: #4f88c6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  text-decoration: none;
}
.btn-delete {
  background-color: #d9534f;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
