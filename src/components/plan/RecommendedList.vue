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
              <div class="d-flex gap-2">
                <button @click="add(place)" class="btn btn-sm btn-outline-success">➕ 추가</button>
                <button @click="toggleDetail(place.no)" class="btn btn-sm btn-outline-primary">
                  🔍 상세보기
                </button>
              </div>
            </div>
            <div v-if="isDetailVisible(place.no)" class="detail-popup shadow-lg">
              <p><strong>개요:</strong></p>
              <div class="overview-box">
                {{ place.overview || '설명이 없습니다.' }}
              </div>
              <br />
              <p class="mt-2"><strong>주차장:</strong></p>
              <ul class="parking-list" v-if="Array.isArray(place.parking)">
                <li v-for="(name, idx) in place.parking.slice(0, 10)" :key="idx">{{ name }}</li>
              </ul>
              <p v-else>{{ place.parking || '주차장 정보 없음' }}</p>
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
      visibleDetails: new Set(),
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
    async toggleDetail(no) {
      if (this.visibleDetails.has(no)) {
        this.visibleDetails.delete(no)
        return
      }

      const place = this.places.find((p) => p.no === no)

      // 💡 lat, lon을 기반으로 주차장 요청
      if (place && place.latitude && place.longitude) {
        try {
          const res = await fetch(`/api/att/search-parking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              lat: place.latitude,
              lon: place.longitude,
            }),
          })

          if (res.ok) {
            const data = await res.json()
            place.parking = data.length > 0 ? data.map((p) => p.prkplceNm) : []
          } else {
            place.parking = ['주차장 정보 요청 실패']
          }
        } catch (err) {
          console.error('주차장 정보 요청 중 오류 발생:', err)
          place.parking = '오류 발생'
        }
      }

      this.visibleDetails.add(no)
    },
    isDetailVisible(no) {
      return this.visibleDetails.has(no)
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
  position: relative;
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

.detail-popup {
  position: absolute;
  top: 2px;
  left: 20px;
  right: 20px;
  z-index: 9999;
  background: #fff;
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
}

.overview-box {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  background: #f9f9f9;
  font-size: 14px;
  border-radius: 8px;
}

.parking-list {
  padding-left: 20px;
  margin-top: 5px;
  font-size: 14px;
  color: #444;
}
</style>
