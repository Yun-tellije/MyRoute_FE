<template>
  <div class="result-container">
    <h1>나만의 계획 세우기</h1>
    <RegionSelector :selectedSido="sido" :selectedGugun="gugun" @update-region="onSearch" />
    <PlanMap :markers="places" :areaName="`${sido} ${gugun}`" />
    <div class="row">
      <div class="col-md-8">
        <RecommendedList
          :places="places"
          v-model:selectedAttId="attId"
          @change-att="changeAtt"
          @add-to-plan="addToPlan"
        />
      </div>
      <div class="col-md-4 place-list-scroll">
        <MyPlan :planItems="planItems" @update-plan="updatePlanItems" @save-plan="savePlan" />
      </div>
    </div>
  </div>
</template>

<script>
import RegionSelector from '@/components/plan/RegionSelector.vue'
import RecommendedList from '@/components/plan/RecommendedList.vue'
import PlanMap from '@/components/plan/PlanMap.vue'
import MyPlan from '@/components/plan/MyPlan.vue'

export default {
  components: { RegionSelector, RecommendedList, PlanMap, MyPlan },
  data() {
    return {
      sido: this.$route.query.sido || '',
      gugun: this.$route.query.gugun || '',
      attId: 0,
      places: history.state.places || [],
      planItems: JSON.parse(localStorage.getItem('planItems')) || [],
    }
  },
  mounted() {
    if (this.sido && this.gugun) {
      this.fetchPlaces()
    }
  },
  watch: {
    planItems: {
      deep: true,
      handler(newVal) {
        localStorage.setItem('planItems', JSON.stringify(newVal))
      },
    },
  },
  methods: {
    addToPlan(place) {
      if (!this.planItems.some((item) => item.no === place.no)) {
        this.planItems.push(place)
        this.updatePlanItems(this.planItems)
      }
    },
    updatePlanItems(newPlan) {
      this.planItems = newPlan
      localStorage.setItem('planItems', JSON.stringify(newPlan))
    },
    changeAtt(attId) {
      this.attId = attId
      this.fetchPlaces()
    },
    onSearch({ sido, gugun }) {
      this.sido = sido
      this.gugun = gugun
      this.fetchPlaces()
    },
    fetchPlaces() {
      fetch('/api/att/attplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sido: this.sido,
          gugun: this.gugun,
          att_id: this.attId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.places = data
        })
        .catch((err) => {
          console.error('Failed to fetch places:', err)
        })
    },
    savePlan() {
      if (this.planItems.length === 0) {
        alert('계획에 담긴 관광지가 없습니다!')
        return
      }

      fetch('/api/att/savePlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.planItems),
      })
        .then((res) => (res.ok ? alert('계획이 저장되었습니다!') : alert('오류 발생')))
        .then(() => {
          localStorage.removeItem('planItems')
          this.updatePlanItems([])
        })
    },
  },
}
</script>

<style scoped>
.result-container {
  max-width: 1200px;
  margin: 50px auto;
  margin-top: 10px;
  padding: 20px;
}

h1 {
  padding-bottom:5%;
  text-align: center;
  font-family: 'GowunDodum-Regular', sans-serif;
}
</style>
