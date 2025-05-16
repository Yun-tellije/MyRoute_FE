<template>
  <div class="notice-detail-container" v-if="notice">
    <h1>{{ notice.title }}</h1>
    <p class="date">{{ formatDate(notice.createdAt) }}</p>
    <div class="content" v-html="notice.content"></div>
    <router-link to="/notices" class="btn-back">← 목록으로 돌아가기</router-link>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'NoticeDetailView',
  data() {
    return {
      notice: null,
    }
  },
  async created() {
    const noticeId = this.$route.params.noticeId

    try {
      const res = await axios.get(`/api/notices/${noticeId}`)
      this.notice = res.data
    } catch (err) {
      console.error('공지사항 상세 불러오기 실패:', err)
    }
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('ko-KR')
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
</style>
