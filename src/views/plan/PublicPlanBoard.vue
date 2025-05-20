<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>공개 여행 계획 모음</h2>

      <div class="d-flex gap-2">
        <!-- 지역 선택 -->
        <select class="form-select" v-model="selectedSido" style="width: 160px">
          <option value="">전체 지역</option>
          <option v-for="(name, code) in sidoMap" :key="code" :value="name">
            {{ name }}
          </option>
        </select>

        <!-- 정렬 기준 -->
        <select class="form-select" v-model="selectedSortBy" style="width: 160px">
          <option value="latest">최신순</option>
          <option value="likes">추천 많은 순</option>
        </select>

        <!-- 조회 버튼 -->
        <button class="btn btn-primary" @click="applyFilter">조회</button>
      </div>
    </div>

    <div v-if="filteredPlans.length === 0" class="alert alert-info">
      현재 공개된 여행 계획이 없습니다.
    </div>

    <div v-else>
      <div
        v-for="(plan, index) in filteredPlans"
        :key="plan.planId"
        class="card mb-3 shadow-sm card-hover"
        @click="goDetail(plan.planId)"
        style="cursor: pointer"
      >
        <div class="row g-0">
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">{{ index + 1 }}. {{ plan.planName }}</h5>
              <p class="card-text">- 작성자: {{ plan.memberId }}</p>
              <p class="card-text">- 지역: {{ plan.areaName }}</p>
              <p class="card-text">- 여행일수: {{ plan.days }}일</p>
              <p class="card-text">- 예산: {{ plan.budget.toLocaleString() }}원</p>
              <p class="card-text">- 추천 수: {{ plan.likeCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-4">
        <button @click="goHome" class="btn btn-secondary">홈으로 돌아가기</button>
      </div>
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
        KR41: '경기도',
        KR42: '강원특별자치도',
        KR43: '충청북도',
        KR44: '충청남도',
        KR30: '대전',
        KR50: '세종특별자치시',
        KR45: '전북특별자치도',
        KR46: '전라남도',
        KR29: '광주',
        KR27: '대구',
        KR47: '경상북도',
        KR48: '경상남도',
        KR26: '부산',
        KR31: '울산',
        KR49: '제주도',
      },
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
  },
  methods: {
    applyFilter() {
      this.filterSido = this.selectedSido
      this.filterSortBy = this.selectedSortBy
    },
    goDetail(planId) {
      this.$router.push(`/plan-detail/${planId}`)
    },
    goHome() {
      this.$router.push('/')
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
.card-title {
  font-weight: 600;
}
.card-hover:hover {
  background-color: #f9f9f9;
  transition: background-color 0.2s ease;
}
</style>
