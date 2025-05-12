<template>
  <div>
    <!-- 타이틀 + attId 선택 -->
    <div class="d-flex justify-content-between align-items-center mb-4" style="gap: 10px">
      <h4 class="mb-0">🌟 추천 관광지 목록</h4>
      <select
        v-model="localAttId"
        class="form-select"
        style="max-width: 200px"
        @change="onAttChange"
      >
        <option value="0">놀거리</option>
        <option value="39">음식점</option>
        <option value="32">숙박</option>
      </select>
    </div>

    <!-- 목록 -->
    <div class="place-list-scroll">
      <div class="row g-4">
        <div v-for="place in places" :key="place.no" class="col-md-6">
          <div class="place-card">
            <img :src="place.first_image1 || '/resource/tripimage.png'" :alt="place.title" />
            <div class="place-info">
              <h5>{{ place.title }}</h5>
              <p>{{ place.content_type_name }}</p>
              <p>{{ place.addr1 }}</p>
              <button @click="add(place)" class="btn btn-sm btn-outline-success">➕ 추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['places', 'selectedAttId'],
  emits: ['add-to-plan', 'change-att'],
  data() {
    return {
      localAttId: this.selectedAttId,
    }
  },
  watch: {
    selectedAttId(newVal) {
      this.localAttId = newVal
    },
  },
  methods: {
    add(place) {
      this.$emit('add-to-plan', place)
    },
    onAttChange() {
      this.$emit('change-att', Number(this.localAttId))
    },
  },
}
</script>

<style scoped>
.place-list-scroll {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.place-card {
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s ease;
  background-color: #fff;
}

.place-card:hover {
  transform: translateY(-5px);
}

.place-card img {
  height: 180px;
  object-fit: cover;
  width: 100%;
}

.place-info {
  padding: 15px;
}

.place-info h5 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.place-info p {
  font-size: 14px;
  color: #555;
}
</style>
