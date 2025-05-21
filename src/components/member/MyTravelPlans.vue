<template>
  <div class="myplans-list">
    <div v-if="plans.length === 0" class="no-data-msg">저장된 여행 계획이 없습니다.</div>
    <div v-else>
      <div
        v-for="plan in plans"
        :key="plan.planId"
        class="plan-card"
        @click="goDetail(plan.planId)"
      >
        <div class="plan-card-title-row">
          <span class="plan-card-title">{{ plan.planName }}</span>
          <span class="plan-card-public" :class="plan.isPublic === 1 ? 'public' : 'private'">
            {{ plan.isPublic === 1 ? '공개' : '비공개' }}
          </span>
        </div>
        <div class="plan-card-info">
          <span
            >지역: <b>{{ plan.areaName }}</b></span
          >
          <span
            >여행일수: <b>{{ plan.days }}일</b></span
          >
          <span
            >예산: <b>{{ plan.budget.toLocaleString() }}원</b></span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyPlanList',
  data() {
    return {
      plans: [],
    }
  },
  async mounted() {
    const authStore = useAuthStore()
    try {
      const res = await axios.get('/api/att/planlist', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      this.plans = res.data
    } catch {
      alert('로그인이 필요합니다.')
      this.$router.push('/login')
    }

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
      this.$router.push(`/plan-detail/${planId}`)
    },
  },
}
</script>

<style scoped>
.myplans-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.no-data-msg {
  color: #b0b0b0;
  text-align: center;
  padding: 48px 0;
  border-radius: 6px;
  font-size: 1.2rem;
  margin-bottom: 24px;
}

.plan-card {
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
  padding: 16px 26px 14px 26px;
  cursor: pointer;
  transition:
    box-shadow 0.18s,
    border 0.18s,
    background 0.18s;
  position: relative;
}
.plan-card:hover {
  background: #f5f5f5;
  border-color: #d3d3d3;
  box-shadow: 0 2px 18px rgba(157, 187, 170, 0.13);
}

.plan-card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.plan-card-title {
  font-size: 1.2rem;
  color: #333;
  letter-spacing: -0.5px;
}

.plan-card-public {
  font-size: 0.98rem;
  font-weight: 500;
  padding: 3px 13px;
  border-radius: 12px;
  margin-left: 10px;
  background: #e0e0e0;
  color: #888;
}
.plan-card-public.public {
  background: #eaf6f0;
  color: #3b7a5a;
}
.plan-card-public.private {
  background: #f9eaea;
  color: #d9534f;
}

.plan-card-info {
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 1.04rem;
  flex-wrap: wrap;
}
.plan-card-info b {
  color: #333;
  font-weight: 500;
}
.plan-card-info span {
  min-width: 120px;
}
</style>
