<template>
  <div class="notice-page">
    <div class="notice-header">
      <h1 class="notice-title-main">공지사항</h1>
      <div class="btn-add-wrap" v-if="isAdmin">
        <router-link to="/notices/write" class="btn-add">등록</router-link>
      </div>
    </div>
    <div class="notice-table-wrap">
      <table class="notice-table">
        <thead>
          <tr>
            <th class="col-title">제목</th>
            <th class="col-writer">작성자</th>
            <th class="col-date">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="notice in pagedNotices"
            :key="notice.id"
            @click="goToDetail(notice.noticeId)"
            class="notice-row"
          >
            <td class="col-title">{{ notice.title }}</td>
            <td class="col-writer">{{ notice.writer || '운영자' }}</td>
            <td class="col-date">{{ formatDate(notice.createAt) }}</td>
          </tr>
          <tr v-if="pagedNotices.length === 0">
            <td colspan="3" class="no-data">등록된 공지사항이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="currentPage === 1" @click="changePage(1)">
        <i class="fa-solid fa-angles-left"></i>
      </button>
      <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        <i class="fa-solid fa-angle-left"></i>
      </button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="page-btn"
        :class="{ active: currentPage === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <i class="fa-solid fa-angle-right"></i>
      </button>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(totalPages)"
      >
        <i class="fa-solid fa-angles-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NoticeListView',
  data() {
    return {
      notices: [],
      currentPage: 1,
      pageSize: 5,
    }
  },
  computed: {
    isAdmin() {
      const store = useAuthStore()
      return store.userRole === 'ADMIN'
    },
    totalPages() {
      return Math.ceil(this.notices.length / this.pageSize)
    },
    pagedNotices() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.notices.slice(start, start + this.pageSize)
    },
    totalNotices() {
      return this.notices.length
    },
    pageNumbers() {
      const total = this.totalPages
      const group = Math.floor((this.currentPage - 1) / 5)
      const start = group * 5 + 1
      const end = Math.min(start + 4, total)
      const arr = []
      for (let i = start; i <= end; i++) arr.push(i)
      return arr
    },
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
      const d = new Date(dateStr)
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
  },
}
</script>

<style scoped>
.notice-page {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 32px 32px;
}
.notice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  align-items: flex-end;
}
.notice-title-main {
  font-size: 2.2rem;
  color: #111;
  margin: 0;
}
.notice-table-wrap {
  width: 100%;
  overflow-x: auto;
}
.notice-table {
  border-top: #ddd 2px solid;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  table-layout: fixed;
}
.notice-table th,
.notice-table td {
  border-bottom: 1px solid #e0e0e0;
  padding: 14px 10px;
  text-align: center;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notice-table td.col-title {
  text-align: left;
}

.notice-table td {
  cursor: pointer;
}

.notice-table th.col-title,
.notice-table td.col-title {
  width: 60%;
  padding-left: 20px;
  color: #222;
  font-weight: 500;
}
.notice-table th.col-writer,
.notice-table td.col-writer,
.notice-table th.col-date,
.notice-table td.col-date {
  width: 20%;
}
.notice-row:hover td {
  background: #f9f9f9;
}
.no-data {
  text-align: center;
  color: #aaa;
  padding: 32px 0;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin: 32px 0 0 0;
}
.page-btn {
  background: #fff;
  border: none;
  color: #444444;
  padding: 6px 14px;
  border-radius: 50%;
  margin: 0 1px;
  cursor: pointer;
  font-size: 1rem;
}

.page-btn.active {
  background: #222;
  color: #fff;
  border-color: #222;
}
.page-btn:disabled {
  color: #aaa;
  cursor: not-allowed;
}
.btn-add-wrap {
  display: flex;
  justify-content: center;
}
.btn-add {
  background: #9dbbaa;
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 10px 24px;
  text-decoration: none;
}
.btn-add:hover {
  background: #aacab8;
  color: #fff;
}
@media (max-width: 700px) {
  .notice-page {
    padding: 18px 2px;
  }
  .notice-table th,
  .notice-table td {
    font-size: 0.95rem;
    padding: 8px 4px;
  }
}
</style>
