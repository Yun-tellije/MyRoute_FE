<template>
  <div>
    <h4 class="mb-4">🗓️ 나의 계획</h4>
    <div id="planList" class="card shadow-sm p-3">
      <div v-if="plans.length === 0" class="text-muted">아직 추가된 관광지가 없습니다.</div>
      <draggable v-model="plans" item-key="no" @end="updateLocalStorage">
        <template #item="{ element }">
          <div class="card mb-2 plan-item">
            <div class="card-body p-2 d-flex align-items-center">
              <img :src="element.image" class="me-2" style="width: 50px; height: 50px" />
              <div>
                <strong>{{ element.title }}</strong
                ><br />
                <small>{{ element.addr }}</small>
              </div>
              <button @click="remove(element.no)" class="btn btn-sm btn-outline-danger ms-auto">
                ✖
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="d-grid mt-3">
      <button @click="savePlans" class="btn btn-success">📝 계획 생성하기</button>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: { draggable },
  props: ['initialPlans'],
  data() {
    return { plans: this.initialPlans || [] }
  },
  methods: {
    remove(no) {
      this.plans = this.plans.filter((item) => item.no !== no)
      this.updateLocalStorage()
    },
    updateLocalStorage() {
      localStorage.setItem('planItems', JSON.stringify(this.plans))
      this.$emit('update-plans', this.plans)
    },
    savePlans() {
      if (this.plans.length === 0) return alert('관광지가 없습니다!')

      fetch('/att/savePlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.plans),
      }).then(() => {
        alert('계획이 저장되었습니다.')
        this.plans = []
        this.updateLocalStorage()
      })
    },
  },
}
</script>

<style scoped>
.card {
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  overflow: hidden;
}

.card-body img {
  object-fit: cover;
}

.btn-outline-danger {
  font-weight: bold;
}
</style>
