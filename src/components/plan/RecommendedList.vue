<template>
  <div ref="wrapper" class="recommend-container">
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4" style="gap: 10px">
        <h4 class="mb-0">
          <i class="fa-solid fa-signs-post" style="color: #ffc107"></i> 추천 관광지 목록
        </h4>

        <div class="d-flex gap-2">
          <input
            type="text"
            class="form-control"
            style="width: 200px"
            v-model="searchInput"
            placeholder="장소 이름 검색"
            @keyup.enter="applySearch"
          />

          <select
            v-model="localAttId"
            class="form-select"
            style="max-width: 200px"
            @change="onAttChange"
          >
            <option value="0">놀거리</option>
            <option value="39">음식점</option>
            <option value="32">숙박</option>
            <option value="-1">나의 즐겨찾기</option>
          </select>
        </div>
      </div>

      <div class="place-list-scroll">
        <div v-if="places.length === 0" class="text-center text-muted py-4">
          군/구를 선택해주세요.
        </div>
        <div class="row g-4">
          <div v-for="place in filteredPlaces" :key="place.no" class="col-md-6">
            <div class="place-card">
              <img :src="place.first_image1 || '/resource/tripimage.png'" :alt="place.title" />
              <div class="place-info">
                <h5>{{ place.title }}</h5>
                <div class="type-group">
                  <p>
                    {{ place.content_type_name }}
                  </p>
                  <p
                    @click="onStarClick(place, $event)"
                    style="cursor: pointer; color: #f5c518"
                    class="star-group"
                  >
                    <i class="fa-solid fa-star" style="color: #ffc107"></i>
                    {{ typeof place.avgRating === 'number' ? place.avgRating.toFixed(1) : '0.0' }}
                  </p>
                </div>

                <div class="gap-2" style="display: flex; align-items: center">
                  <button @click="add(place)" class="btn btn-sm">추가</button>
                  <button @click="toggleDetail(place.no)" class="btn2 btn2-sm">상세보기</button>
                  <img
                    :src="
                      place.isFavorite
                        ? '/resource/bookmark.png'
                        : '/resource/selected-bookmark.png'
                    "
                    alt="즐겨찾기"
                    style="width: 20px; height: 20px; cursor: pointer"
                    @click="toggleFavorite(place)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPopup" class="rating-popup" :style="{ top: popupY + 'px', left: popupX + 'px' }">
      <div class="popup-inner">
        <h6>리뷰</h6>
        <ul class="popup-list">
          <li
            v-for="post in relatedHotplaces"
            :key="post.hotplaceId"
            @click="goDetail(post.hotplaceId)"
          >
            <strong>{{ post.title }}</strong> ({{ post.starPoint.toFixed(1) }}점)<br />
            <small class="text-muted">{{ post.content }}</small>
          </li>
        </ul>
        <button @click="showPopup = false" class="popup-close">닫기</button>
      </div>
    </div>

    <div v-if="selectedDetail" class="modal-backdrop" @click.self="selectedDetail = null">
      <div class="modal-content-box">
        <h5>{{ selectedDetail.title }}</h5>
        <div class="overview-box">
          <span v-if="selectedDetail.overview">
            {{ selectedDetail.overview }}
          </span>
          <span v-else>
            설명이 없습니다.
            <strong style="cursor: pointer; color: #0d6efd" @click="askLuti(selectedDetail.title)">
              루티에게 물어보세요!</strong
            >
          </span>
        </div>
        <br />
        <div>
          <p>
            <strong>
              <img src="/resource/pin.svg" alt="주소" style="width: 16px; height: 16px" />
              주소
            </strong>
          </p>
          <p style="margin-left: 16px">{{ selectedDetail.addr1 }}</p>
        </div>
        <div>
          <p class="mt-3">
            <strong>
              <img src="/resource/parking.svg" alt="주차장" style="width: 16px; height: 16px" />
              주변 주차장 정보
            </strong>
          </p>

          <template v-if="Array.isArray(selectedDetail.parking)">
            <ul v-if="selectedDetail.parking.length > 0">
              <li
                v-for="(name, idx) in selectedDetail.parking"
                :key="idx"
                style="margin-left: 16px; margin-bottom: 2px"
              >
                {{ name }}
              </li>
            </ul>
            <p v-else style="margin-left: 16px">주차장 정보 없음</p>
          </template>
          <p v-else style="margin-left: 16px">{{ selectedDetail.parking || '주차장 정보 없음' }}</p>
        </div>

        <button class="btn-close-modal" @click="selectedDetail = null">닫기</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  props: ['places', 'selectedAttId'],
  emits: ['add-to-plan', 'change-att'],
  data() {
    return {
      localAttId: this.selectedAttId,
      visibleDetails: new Set(),
      selectedDetail: null,

      relatedHotplaces: [],
      showPopup: false,
      popupX: 0,
      popupY: 0,
      searchInput: '',
      searchKeyword: '',
    }
  },
  computed: {
    filteredPlaces() {
      const keyword = this.searchKeyword.trim().toLowerCase()
      const attId = Number(this.localAttId)

      return this.places.filter((place) => {
        const matchesKeyword = !keyword || place.title.toLowerCase().includes(keyword)

        if (attId === -1) {
          return place.isFavorite && matchesKeyword
        }

        const matchesAtt = attId === 0 || place.content_type_id === attId
        return matchesAtt && matchesKeyword
      })
    },
  },

  watch: {
    selectedAttId(newVal) {
      this.localAttId = newVal
    },
    places: {
      handler() {
        this.loadFavorites()
      },
      immediate: true,
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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

      if (!place.overview && window.suggestPlaceToChatbot) {
        window.suggestPlaceToChatbot(place.title)
      }
    },
    async onStarClick(place, event) {
      const rect = event.target.getBoundingClientRect()
      const wrapperRect = this.$refs.wrapper.getBoundingClientRect()

      this.popupX = rect.left - wrapperRect.left
      this.popupY = rect.bottom - wrapperRect.top

      try {
        const res = await fetch('/api/hotplace/posts')
        const posts = await res.json()
        this.relatedHotplaces = posts.filter((p) => p.attractionNo === place.no)
        this.showPopup = true
      } catch (err) {
        console.error('핫플레이스 데이터 로딩 실패', err)
      }
    },
    applySearch(event) {
      this.searchKeyword = event.target.value.trim()
    },
    goDetail(id) {
      window.open(`/hotplaceDetail/${id}`, '_blank')
    },
    askLuti(title) {
      if (window.suggestPlaceToChatbot) {
        window.suggestPlaceToChatbot(title)
      }

      const toggleBtn = document.querySelector('.chatbot-container .toggle-btn')
      if (toggleBtn) {
        toggleBtn.click()
      }

      this.selectedDetail = null
    },
    async toggleFavorite(place) {
      const authStore = useAuthStore()
      const token = authStore.token
      if (!token) {
        alert('로그인이 필요한 기능입니다.')
        authStore.logout()
        return
      }

      const isAdding = !place.isFavorite

      try {
        await fetch(`/api/att/favorite/${isAdding ? 'add' : 'remove'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            attractionNo: place.no,
          }),
        })
        place.isFavorite = isAdding

        if (isAdding) {
          alert('즐겨찾기에 등록되었습니다!')
        } else {
          alert('즐겨찾기에서 해제되었습니다.')
        }
      } catch (err) {
        
        console.error('즐겨찾기 처리 실패:', err)
      }
    },

    async loadFavorites() {
      const authStore = useAuthStore()
      const token = authStore.token
      if (!token || !Array.isArray(this.places)) return

      try {
        const res = await fetch('/api/att/favorite/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const favorites = await res.json()
        const favoriteSet = new Set(favorites.map((f) => f.attractionNo))

        this.places.forEach((p) => {
          p.isFavorite = favoriteSet.has(p.no)
        })

        this.$forceUpdate()
      } catch (err) {
        authStore.logout()
        console.error('즐겨찾기 목록 로딩 실패:', err)
      }
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

.type-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.type-group > p {
  padding: 0;
}
.star-group {
  border-bottom: 2px solid #ffc107;
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
  margin-bottom: 4px;
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
  border-radius: 4px;
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

.rating-popup {
  position: absolute;
  margin-top: 20px;
  z-index: 3000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  animation: fade-in 0.3s ease-out;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
}

.popup-inner {
  max-height: 300px;
  overflow-y: auto;
}

.popup-list li {
  margin-bottom: 10px;
  font-size: 14px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup-close {
  margin-top: 10px;
  background: #adb5bd;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes fade-in {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.recommend-container {
  position: relative;
}
</style>
