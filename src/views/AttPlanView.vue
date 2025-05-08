<template>
  <div class="result-container">
    <!-- RegionForm (시군구 선택 & 조회) -->
    <RegionSelect
      :initialSido="sido"
      :initialGugun="gugun"
      :areaData="areaData"
      @update-gugun="handleGugunChange"
      @search="fetchAttractions"
    />

    <!-- Map Statistics -->
    <MapStatistics v-if="sido && gugun" :sido="sido" :gugun="gugun" />

    <div class="row">
      <!-- 추천 관광지 목록 -->
      <div class="col-md-8">
        <PlaceList :items="atts" @add-to-plan="addToPlan" />
      </div>

      <!-- 나의 계획 -->
      <div class="col-md-4">
        <PlanList :planItems="planItems" @remove-item="removeFromPlan" @reorder="updatePlanOrder" />
        <div class="d-grid mt-3">
          <button class="btn btn-success" @click="submitPlan">📝 계획 생성하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RegionSelect from '@/components/RegionSelect.vue'
import MapStatistics from '@/components/MapStatistics.vue'
import PlaceList from '@/components/PlaceList.vue'
import PlanList from '@/components/PlanList.vue'

export default {
  name: 'AttPlanView',
  components: { RegionSelect, MapStatistics, PlaceList, PlanList },
  data() {
    return {
      sido: this.$route.query.sido || '',
      gugun: this.$route.query.gugun || '',
      atts: [],
      planItems: JSON.parse(localStorage.getItem('planItems') || '[]'),
      areaData: {
        /* 기존 areaData 그대로 복사 */
      },
    }
  },
  methods: {
    handleGugunChange(gugun) {
      this.gugun = gugun
      this.$router.replace({ query: { sido: this.sido, gugun } })
    },
    async fetchAttractions() {
      if (!this.sido || !this.gugun) return
      const res = await this.$axios.post('/api/att/attplan', {
        sido: this.sido,
        gugun: this.gugun,
        att_id: 0,
      })
      this.atts = res.data
    },
    addToPlan(item) {
      if (!this.planItems.find((i) => i.no === item.no)) {
        this.planItems.push(item)
        localStorage.setItem('planItems', JSON.stringify(this.planItems))
      }
    },
    removeFromPlan(no) {
      this.planItems = this.planItems.filter((i) => i.no !== no)
      localStorage.setItem('planItems', JSON.stringify(this.planItems))
    },
    updatePlanOrder(newOrder) {
      this.planItems = newOrder
      localStorage.setItem('planItems', JSON.stringify(this.planItems))
    },
    async submitPlan() {
      if (!this.planItems.length) {
        return alert('계획에 담긴 관광지가 없습니다!')
      }
      await this.$axios.post('/api/att/savePlan', this.planItems)
      alert('📝 계획이 성공적으로 저장되었습니다!')
      this.planItems = []
      localStorage.removeItem('planItems')
    },
  },
}
</script>

<style scoped>
.result-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
</style>
