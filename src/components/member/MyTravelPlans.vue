<template>
  <div class="container mt-5">
    <h2 class="mb-4">나의 여행 계획 리스트</h2>

    <div v-if="plans.length === 0" class="alert alert-warning">저장된 여행 계획이 없습니다.</div>

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
              <p class="card-text">- 지역: {{ plan.areaName }}</p>
              <p class="card-text">- 예산: {{ plan.budget.toLocaleString() }}원</p>
              <p class="card-text">- 여행일수: {{ plan.days }}일</p>
              <p class="card-text">- 공개여부: {{ plan.isPublic === 1 ? '공개' : '비공개' }}</p>
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
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyPlanList',
  data() {
    return {
      plans: [],
    }
  },
  mounted() {
    const authStore = useAuthStore()

    fetch('/api/att/planlist', {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('로그인 필요')
        return res.json()
      })
      .then((data) => {
        this.plans = data
      })
      .catch(() => {
        alert('로그인이 필요합니다.')
        this.$router.push('/login')
      })

    if (!window.location.pathname.includes('/attplan')) {
      localStorage.removeItem('planItems')
      localStorage.removeItem('editPlan')
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goDetail(planId) {
      this.$router.push(`/my-plan-detail/${planId}`)
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
