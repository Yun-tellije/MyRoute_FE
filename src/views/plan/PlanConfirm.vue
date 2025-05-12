<template>
  <div class="container mt-4">
    <h2>📝 {{ sido }} 최종 여행 계획 확인</h2>

    <div class="row mt-4">
      <!-- 지도 영역 -->
      <div class="col-md-7">
        <PlanMap :markers="[]" :planMarkers="planItems" :areaName="'여행 지도'" />
      </div>

      <!-- 우측 정보 영역 -->
      <div class="col-md-5">
        <div class="mb-3">
          <label class="form-label"><h3>여행 계획 이름</h3></label>
          <input
            type="text"
            v-model="title"
            class="form-control"
            placeholder="예: 봄방학 부산 여행"
            required
          />
        </div>
        <ul class="list-group mb-4">
          <li class="list-group-item" v-for="(item, index) in planItems" :key="item.no">
            {{ index + 1 }}. {{ item.title }} <br />
            ({{ item.addr1 }}) <br />
            {{ item.content_type_name }}
          </li>
        </ul>

        <div class="mb-3">
          <label class="form-label">여행 일수</label>
          <input type="number" v-model="days" class="form-control" min="1" placeholder="예: 3" />
        </div>

        <div class="mb-3">
          <label class="form-label">예상 경비 (₩)</label>
          <input
            type="number"
            v-model="budget"
            class="form-control"
            min="0"
            placeholder="예: 250000"
          />
        </div>

        <div class="d-grid gap-2">
          <button class="btn btn-primary" @click="submitPlan">✅ 최종 저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlanMap from '@/components/plan/PlanMap.vue'

export default {
  components: { PlanMap },
  data() {
    return {
      planItems: [],
      title: '',
      days: 1,
      budget: 0,
      sido: this.$route.query.sido || '',
    }
  },
  mounted() {
    const storedPlans = localStorage.getItem('planItems')
    if (storedPlans) {
      this.planItems = JSON.parse(storedPlans)
    }
  },
  methods: {
    submitPlan() {
      if (this.planItems.length === 0) {
        return alert('계획이 비어있습니다.')
      }
      if (!this.days || !this.budget) {
        return alert('일정과 경비를 입력해주세요.')
      }

      const payload = {
        title: this.title,
        plans: this.planItems,
        days: this.days,
        budget: this.budget,
        sido: this.sido,
      }

      fetch('/api/att/savePlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.ok) {
            alert('여행 계획이 저장되었습니다!')
            localStorage.removeItem('planItems')
            this.$router.push('/')
          } else {
            alert('저장 중 오류 발생')
          }
        })
        .catch(() => {
          alert('서버 요청 실패')
        })
    },
  },
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
}
</style>
