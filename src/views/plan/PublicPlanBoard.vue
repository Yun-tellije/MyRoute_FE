<template>
  <div class="public-plan-page">
    <div class="public-plan-header">
      <h2 class="public-plan-title">공개 여행 계획 모음</h2>
      <div class="public-plan-filter">
        <select class="form-select" v-model="selectedSido" style="width: 160px">
          <option value="">전체 지역</option>
          <option v-for="(name, code) in sidoMap" :key="code" :value="name">
            {{ name }}
          </option>
        </select>
        <select class="form-select" v-model="selectedSortBy" style="width: 100px">
          <option value="latest">최신순</option>
          <option value="likes">추천순</option>
        </select>
        <button class="search-btn" @click="applyFilter">조회</button>
      </div>
    </div>

    <div class="public-plan-table-wrap">
      <table class="public-plan-table">
        <thead>
          <tr>
            <th class="col-title">제목</th>
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
            <td class="col-writer">{{ plan.memberId }}</td>
            <td class="col-likes">{{ plan.likeCount }}</td>
          </tr>
          <tr v-if="pagedPlans.length === 0">
            <td colspan="3" class="no-data">현재 공개된 여행 계획이 없습니다.</td>
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
</template>

<script>
export default {
  name: 'PublicPlanBoard',
  data() {
    return {
      plans: [],
      selectedSido: '',
      selectedSortBy: 'latest',
      filterSido: '',
      filterSortBy: 'latest',
      sidoMap: {
        KR11: '서울',
        KR28: '인천',
        KR30: '대전',
        KR27: '대구',
        KR29: '광주',
        KR26: '부산',
        KR31: '울산',
        KR50: '세종특별자치시',
        KR41: '경기도',
        KR42: '강원특별자치도',
        KR43: '충청북도',
        KR44: '충청남도',
        KR47: '경상북도',
        KR48: '경상남도',
        KR45: '전북특별자치도',
        KR46: '전라남도',
        KR49: '제주도',
      },
      currentPage: 1,
      pageSize: 5,
    }
  },
  computed: {
    filteredPlans() {
      let filtered = this.filterSido
        ? this.plans.filter((p) => p.areaName === this.filterSido)
        : [...this.plans]

      if (this.filterSortBy === 'likes') {
        filtered.sort((a, b) => b.likeCount - a.likeCount)
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return filtered
    },
    totalPages() {
      return Math.ceil(this.filteredPlans.length / this.pageSize)
    },
    pagedPlans() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredPlans.slice(start, start + this.pageSize)
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
  methods: {
    applyFilter() {
      this.filterSido = this.selectedSido
      this.filterSortBy = this.selectedSortBy
      this.currentPage = 1
    },
    goDetail(planId) {
      this.$router.push(`/plan-detail/${planId}`)
    },
    goHome() {
      this.$router.push('/')
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
  mounted() {
    fetch('/api/att/publicPlans', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        this.plans = data
      })
      .catch((err) => {
        console.error('공개 계획 조회 실패:', err)
      })
  },
}
</script>

<style scoped>
.public-plan-page {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 32px 32px;
}
.public-plan-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  align-items: flex-end;
}
.public-plan-title {
  font-size: 2.2rem;
  color: #111;
  margin: 0;
}
.public-plan-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-btn {
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  background-color: #9dbbaa;
  color: white;
}
.serrch-btn:hover {
  background-color: #aacab8;
}
.public-plan-table-wrap {
  width: 100%;
  overflow-x: auto;
}
.public-plan-table {
  border-top: #ddd 2px solid;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  table-layout: fixed;
}
.public-plan-table th,
.public-plan-table td {
  border-bottom: 1px solid #e0e0e0;
  padding: 14px 10px;
  text-align: center;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.public-plan-table td.col-title {
  text-align: left;
}
.public-plan-table th-col title {
  left: 30px;
}

.public-plan-table th.col-title,
.public-plan-table td.col-title {
  width: 65%;
  padding-left: 20px;
  color: #222;
  font-weight: 500;
}
.public-plan-table th.col-writer,
.public-plan-table td.col-writer {
  width: 15%;
}
.public-plan-table th.col-likes,
.public-plan-table td.col-likes {
  width: 10%;
}
.plan-row:hover td {
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
.page-btn-num:not(.active):hover {
  background: #f0f0f0;
}
.area-badge {
  color: #777777;
  margin-right: 6px;
}
@media (max-width: 700px) {
  .public-plan-page {
    padding: 18px 2px;
  }
  .public-plan-table th,
  .public-plan-table td {
    font-size: 0.95rem;
    padding: 8px 4px;
  }
}
</style>
