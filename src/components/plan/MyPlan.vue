<template>
  <div>
    <h4 class="mb-4">🗓️ 나의 계획</h4>
    <div id="planList" class="card shadow-sm p-3">
      <div v-if="plans.length === 0" class="text-muted">아직 추가된 관광지가 없습니다.</div>
      <draggable v-model="plans" item-key="no" @end="updateLocalStorage" @change="updateLocalStorage">
        <template #item="{ element }">
          <div class="card mb-2 plan-item">
            <div class="card-body p-2 d-flex align-items-center">
              <img :src="element.first_image1 || '/resource/tripimage.png'" class="me-2" style="width: 50px; height: 50px" />
              <div>
                <strong>{{ element.title }}</strong
                ><br />
                <small>{{ element.content_type_name }}</small>
              </div>
              <button @click="remove(element.no)" class="xmark-icon ms-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16">
                  <path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                </svg>
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="d-grid mt-3">
      <button @click="savePlans" class="btn">계획 생성하기</button>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: { draggable },
  props: ['planItems'],
  data() {
    return { plans: this.planItems || [] }
  },
  watch: {
    planItems: {
      handler(newVal) {
        this.plans = [...newVal]
      },
      deep: true,
    },
  },
  methods: {
    remove(no) {
      this.plans = this.plans.filter((item) => item.no !== no)
      this.$emit('update-plan', [...this.plans]);
      localStorage.setItem('planItems', JSON.stringify(this.plans));
    },
    updateLocalStorage() {
      console.log('updateLocalStorage', this.plans)
      this.$emit('update-plan', [...this.plans]);
      localStorage.setItem('planItems', JSON.stringify(this.plans))
      
    },
    savePlans() {
      if (this.plans.length === 0) return alert('관광지가 없습니다!')

      localStorage.setItem('planItems', JSON.stringify(this.plans)) // 임시 저장
      
      this.$router.push({
        path: '/plan/confirm',
        query: {
          sido: this.$route.query.sido,
        }
      })
    },
  },
}
</script>

<style scoped>
.card {
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  overflow: hidden;
}

.card-body img {
  object-fit: cover;
}

.xmark-icon {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.xmark-icon:hover {
  color: red;
}

.xmark-icon svg {
  width: 16px;
  height: 16px;
}


.btn-outline-danger {
  font-weight: bold;
}

.btn {
  background-color: #9DBBAA;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background-color: #aacab8;
}

</style>
