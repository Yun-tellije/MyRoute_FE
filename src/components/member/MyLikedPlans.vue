<template>
  <div class="myplanlist-page">
    <div v-if="plans.length === 0" class="no-data-msg">좋아요한 여행 계획이 없습니다.</div>
    <div v-else>
      <div class="myplanlist-table-wrap">
        <table class="myplanlist-table">
          <thead>
            <tr>
              <th class="col-title">[지역] 제목</th>
              <th class="col-writer">작성자</th>
              <th class="col-likes">추천수</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="plan in pagedPlans"
              :key="plan.planId"
              @click="goDetail(plan.planId)"
              class="plan-row"
            >
              <td class="col-title">
                <span class="area-badge">[{{ getShortAreaName(plan.areaName) }}]</span
                >{{ plan.planName }}
              </td>
              <td class="col-writer">{{ plan.memberName }}</td>
              <td class="col-likes">{{ plan.likeCount }}</td>
            </tr>
            <tr v-if="pagedPlans.length === 0">
              <td colspan="4" class="no-data">좋아요한 여행 계획이 없습니다.</td>
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
          class="page-btn page-btn-num"
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
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyLikedPlans',
  data() {
    return {
      plans: [],
      currentPage: 1,
      pageSize: 5,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.plans.length / this.pageSize)
    },
    pagedPlans() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.plans.slice(start, start + this.pageSize)
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
  async mounted() {
    const authStore = useAuthStore()
    try {
      const res = await axios.get('/api/att/plans/liked', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      this.plans = res.data
    } catch {
      alert('로그인이 필요합니다.')
      authStore.logout()
      this.$router.push('/login')
    }
  },
  methods: {
    goDetail(planId) {
      this.$router.push(`/plan-detail/${planId}`)
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    getShortAreaName(areaName) {
      const map = {
        세종특별자치시: '세종',
        강원특별자치도: '강원',
        경기도: '경기',
        충청북도: '충북',
        충청남도: '충남',
        경상북도: '경북',
        경상남도: '경남',
        전북특별자치도: '전북',
        전라남도: '전남',
        제주도: '제주',
      }
      return map[areaName] || areaName
    },
  },
}
</script>

<style scoped>
.myplanlist-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 0 40px 0;
}
.myplanlist-table-wrap {
  width: 100%;
  overflow-x: auto;
}
.myplanlist-table {
  border-top: #ddd 1px solid;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  table-layout: fixed;
}
.myplanlist-table th,
.myplanlist-table td {
  border-bottom: 1px solid #e0e0e0;
  padding: 14px 10px;
  text-align: center;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.myplanlist-table td.col-title {
  text-align: left;
}
.myplanlist-table th.col-title,
.myplanlist-table td.col-title {
  width: 45%;
  padding-left: 20px;
  color: #222;
  font-weight: 500;
}
.myplanlist-table th.col-writer,
.myplanlist-table td.col-writer {
  width: 20%;
}
.myplanlist-table th.col-likes,
.myplanlist-table td.col-likes {
  width: 15%;
}

.plan-row:hover td {
  background: #f9f9f9;
  cursor: pointer;
}
.no-data,
.no-data-msg {
  text-align: center;
  color: #aaa;
  padding: 32px 0;
}
.area-badge {
  color: #777777;
  margin-right: 6px;
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
.page-btn-num:not(.active):hover {
  background: #f0f0f0;
}
@media (max-width: 700px) {
  .myplanlist-page {
    padding: 18px 2px;
  }
  .myplanlist-table th,
  .myplanlist-table td {
    font-size: 0.95rem;
    padding: 8px 4px;
  }
}
</style>
