<template>
  <div class="form-section">
    <h2>나만의 여행 계획 세우기</h2>
    <br />
    <p>지역을 선택해주세요</p>
    <br>

    <select class="form-select" v-model="localSido" @change="emitSido">
      <option disabled value="">시도 선택</option>
      <option v-for="(guguns, sido) in areaData" :key="sido" :value="sido">{{ sido }}</option>
    </select>

    <select
      class="form-select"
      v-model="localGugun"
      :disabled="!localSido"
      @change="$emit('update-gugun', localGugun)"
    >
      <option disabled value="">시군구 선택</option>
      <option v-for="gugun in areaData[localSido] || []" :key="gugun">{{ gugun }}</option>
    </select>

    <button class="btn btn-primary" @click="$emit('submit-form')">계획 생성하기</button>
  </div>
</template>

<script>
export default {
  props: ['sido', 'gugun', 'areaData'],
  data() {
    return {
      localSido: this.sido,
      localGugun: this.gugun,
    }
  },
  watch: {
    sido(val) {
      this.localSido = val
    },
    gugun(val) {
      this.localGugun = val
    },
  },
  methods: {
    emitSido() {
      this.$emit('update-sido', this.localSido)
    },
  },
}
</script>

<style scoped>
.form-section {
  flex: 1;
  padding: 40px;

  display: flex;
  flex-direction: column;
  justify-content: center; /* 수직 가운데 정렬 */
}

.form-select,
.btn {
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  font-size: 16px;
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  transition: border-color 0.3s ease;
}

.form-select:focus,
.btn:focus {
  outline: none;
  border-color: #9DBBAA;
}

.btn {
  background-color: #9DBBAA;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background-color: #aacab8;
}

.form-select {
  background-color: white;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml,%3Csvg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1L5 5L9 1" stroke="%23333" stroke-width="1.5"/%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 10px 6px;
}
</style>
