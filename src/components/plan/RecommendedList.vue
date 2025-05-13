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

    <div class="place-list-scroll">
      <div class="row g-4">
        <div v-for="place in places" :key="place.no" class="col-md-6">
          <div class="place-card">
            <img :src="place.first_image1 || '/resource/tripimage.png'" :alt="place.title" />
            <div class="place-info">
              <h5>{{ place.title }}</h5>
              <p>{{ place.content_type_name }}</p>
              <div class="d-flex gap-2">
                <button @click="add(place)" class="btn btn-sm">추가</button>
                <button @click="toggleDetail(place.no)" class="btn2 btn2-sm">상세보기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedDetail" class="modal-backdrop" @click.self="selectedDetail = null">
    <div class="modal-content-box">
      <h5>{{ selectedDetail.title }}</h5>
      <div class="overview-box">
        {{ selectedDetail.overview || '설명이 없습니다.' }}
      </div>
      <br />
      <div>
        <p>
          <strong
            ><img src="/resource/pin.svg" alt="주소" style="width: 16px; height: 16px" />
            주소</strong
          >
        </p>
        <p style="margin-left: 16px">{{ selectedDetail.addr1 }}</p>
      </div>
      <div>
        <p class="mt-3">
          <strong
            ><img src="/resource/parking.svg" alt="주차장" style="width: 16px; height: 16px" /> 주변
            주차장 정보</strong
          >
        </p>
        <ul v-if="Array.isArray(selectedDetail.parking)">
          <li
            v-for="(name, idx) in selectedDetail.parking"
            :key="idx"
            style="margin-left: 16px; margin-bottom: 2px"
          >
            {{ name }}
          </li>
        </ul>
        <p v-else>{{ selectedDetail.parking || '주차장 정보 없음' }}</p>
      </div>

      <button class="btn-close-modal" @click="selectedDetail = null">닫기</button>
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
      selectedDetail: null,
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
      if (!place) return

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

      this.selectedDetail = place
    },
  },
}
</script>

<style scoped>
p,
ul {
  margin: 0;
  padding: 3px;
}

li {
  list-style: none;
}

.place-list-scroll {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.place-card {
  position: relative;
  border-radius: 6px;
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

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content-box {
  position: relative;
  background: #fff;
  padding: 30px;
  border-radius: 6px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.btn-close-modal {
  position: absolute;
  bottom: 30px;
  right: 30px;
  padding: 6px 12px;
  background-color: #adb5bd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-close-modal:hover {
  background-color: #868e96;
}

.overview-box {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  background: #f9f9f9;
  font-size: 14px;
  border-radius: 6px;
}

.parking-list {
  padding-left: 20px;
  margin-top: 5px;
  font-size: 14px;
  color: #444;
}

.btn,
.btn2 {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
}

.btn {
  background-color: #9dbbaa;
}

.btn:hover {
  background-color: #aacab8;
}

.btn2 {
  background-color: #adb5bd;
}

.btn2:hover {
  background-color: #868e96;
}
</style>
