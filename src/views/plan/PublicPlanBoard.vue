<template>
  <div class="container mt-5">
    <h2 class="mb-4">공개 여행 계획 모음</h2>

    <div v-if="plans.length === 0" class="alert alert-info">현재 공개된 여행 계획이 없습니다.</div>

    <div v-else>
      <div
        v-for="(plan, index) in plans"
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
    }
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
  methods: {
    goDetail(planId) {
      this.$router.push(`/public-plan-detail/${planId}`)
    },
    goHome() {
      this.$router.push('/')
    },
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
