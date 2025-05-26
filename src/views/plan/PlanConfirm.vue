<template>
  <div class="container mt-4">
    <button class="btn-back" @click="$router.back">
      <i class="fa-solid fa-caret-left"></i>&nbsp;이전으로 돌아가기
    </button>
    <h2>최종 {{ sido }} 여행 계획 확인</h2>

    <div class="row mt-4">
      <div class="col-md-7">
        <PlanMap :markers="[]" :planMarkers="planItems" :areaName="'여행 지도'" />
      </div>

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
            {{ index + 1 }}. {{ item.title }}&nbsp;&nbsp;<span style="color: #666"
              >({{ item.content_type_name }})</span
            >
            <br />
            ({{ item.addr1 }}) <br />
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

        <div class="mb-3">
          <label class="form-label"><h5>공개 여부</h5></label>
          <div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="public"
                :value="1"
                v-model="isPublic"
              />
              <label class="form-check-label" for="public">공개</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="private"
                :value="0"
                v-model="isPublic"
              />
              <label class="form-check-label" for="private">비공개</label>
            </div>
          </div>
        </div>

        <div class="d-grid gap-2">
          <button class="btn-submit" @click="submitPlan">최종 저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlanMap from '@/components/plan/PlanMap.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  components: { PlanMap },
  data() {
    return {
      planItems: [],
      title: '',
      days: 1,
      budget: 0,
      sido: this.$route.query.sido || '',
      editPlanId: null,
      isPublic: '1',
    }
  },
  mounted() {
    const token = useAuthStore().token

    if (!token) {
      alert('로그인이 필요한 서비스입니다.')
      useAuthStore().logout()
      this.$router.push('/login')
      return
    }

    const storedPlans = localStorage.getItem('planItems')
    const editPlan = JSON.parse(localStorage.getItem('editPlan'))

    if (editPlan) {
      this.planItems = editPlan.places || []
      this.title = editPlan.planName
      this.days = editPlan.days
      this.budget = editPlan.budget
      this.editPlanId = editPlan.planId
    } else if (storedPlans) {
      this.planItems = JSON.parse(storedPlans)
    }
  },
  methods: {
    submitPlan() {
      if (this.planItems.length === 0) {
        return alert('계획이 비어있습니다.')
      }
      if (!this.title.trim()) {
        return alert('여행 제목을 입력해주세요.')
      }
      if (!this.days) {
        return alert('일정을 입력해주세요.')
      }

      const payload = {
        title: this.title,
        days: this.days,
        budget: this.budget,
        sido: this.sido,
        isPublic: this.isPublic,
        places: this.planItems.map((item, index) => ({
          attractionNo: item.no,
          latitude: item.latitude,
          longitude: item.longitude,
          placeName: item.title,
          addr1: item.addr1,
          first_image1: item.first_image1,
          visitOrder: index + 1,
        })),
      }

      const url = this.editPlanId ? `/api/att/updatePlan/${this.editPlanId}` : `/api/att/savePlan`

      fetch(url, {
        method: this.editPlanId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useAuthStore().token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.ok) {
            alert(`여행 계획이 ${this.editPlanId ? '수정' : '저장'}되었습니다!`)
            localStorage.removeItem('planItems')
            localStorage.removeItem('editPlan')
            if (this.editPlanId) {
              this.$router.push(`/plan-detail/${this.editPlanId}`)
            } else {
              this.$router.push('/member/posts')
            }
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}
.btn-back {
  display: flex;
  align-items: center;
  background: none;
  color: #666;
  border: none;
  border-radius: 4px;
  padding: 7px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  margin-right: auto;
  margin-bottom: 10px;
}

.btn-submit {
  background-color: #9dbbaa;
  color: white;
  border: none;
  padding: 6px 0;
  border-radius: 6px;
}
</style>
