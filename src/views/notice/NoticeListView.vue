<template>
  <div class="notice-container">
    <h1 class="page-title">공지사항</h1>

    <ul class="notice-list">
      <li
        v-for="notice in notices"
        :key="notice.id"
        class="notice-item"
        @click="goToDetail(notice.noticeId)"
      >
        <h3>{{ notice.title }}</h3>
        <p class="date">{{ formatDate(notice.createdAt) }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'NoticeListView',
  data() {
    return {
      notices: [],
    }
  },
  created() {
    this.fetchNotices()
  },
  methods: {
    async fetchNotices() {
      try {
        const res = await axios.get('/api/notices')
        this.notices = res.data
      } catch (err) {
        console.error('공지사항 불러오기 실패:', err)
      }
    },
    goToDetail(noticeId) {
      this.$router.push(`/notices/${noticeId}`)
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('ko-KR')
    },
  },
}
</script>
