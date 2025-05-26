<template>
  <div class="mybookmark-page">
    <h2 class="bookmark-title">저장된 관광지</h2>
    <div v-if="pagedPlaces.length === 0" class="no-data-msg">즐겨찾기한 관광지가 없습니다.</div>
    <div v-else>
      <div class="bookmark-card-grid">
        <div v-for="place in pagedPlaces" :key="place.no" class="place-card">
          <img :src="place.first_image1 || '/resource/tripimage.png'" :alt="place.title" />
          <div class="place-info">
            <h5>{{ place.title }}</h5>
            <div class="type-group">
              <p>{{ place.content_type_name }}</p>
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
              <button @click="toggleDetail(place.no)" class="btn2 btn2-sm">상세보기</button>
              <img
                :src="
                  !place.isFavorite ? '/resource/bookmark.png' : '/resource/selected-bookmark.png'
                "
                alt="즐겨찾기"
                style="width: 20px; height: 20px; cursor: pointer"
                @click="toggleFavorite(place)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(1)">
          <i class="fa-solid fa-angles-left"></i>
        </button>
        <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="page-btn page-btn-num"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fa-solid fa-angle-right"></i>
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(totalPages)"
        >
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </div>
    </div>

    <div v-if="selectedDetail" class="modal-backdrop" @click.self="selectedDetail = null">
      <div class="modal-content-box">
        <h5>{{ selectedDetail.title }}</h5>
        <div class="overview-box scroll-overview">
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
              <i class="fa-solid fa-location-dot"></i>
              주소
            </strong>
          </p>
          <p style="margin-left: 16px; margin-bottom: 10px">{{ selectedDetail.addr1 }}</p>
        </div>
        <div>
          <p>
            <strong>
              <img src="/resource/parking.svg" alt="주차장" style="width: 16px; height: 16px" />
              주변 주차장 정보
            </strong>
          </p>
          <ul v-if="Array.isArray(selectedDetail.parking)" class="parking-list">
            <li v-for="(name, idx) in selectedDetail.parking" :key="idx" class="parking-li">
              {{ name }}
            </li>
          </ul>
          <p v-else>{{ selectedDetail.parking || '주차장 정보 없음' }}</p>
        </div>
        <button class="btn-close-modal" @click="selectedDetail = null">닫기</button>
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
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyBookMarksView',
  data() {
    return {
      places: [],
      currentPage: 1,
      perPage: 6,
      showPopup: false,
      popupX: 0,
      popupY: 0,
      relatedHotplaces: [],
      selectedDetail: null,
    }
  },
  computed: {
    pagedPlaces() {
      const start = (this.currentPage - 1) * this.perPage
      return this.places.slice(start, start + this.perPage)
    },
    totalPages() {
      return Math.ceil(this.places.length / this.perPage)
    },
    pageNumbers() {
      const total = this.totalPages
      const group = Math.floor((this.currentPage - 1) / 5)
      const start = group * 5 + 1
      const end = Math.min(start + 4, total)
      const arr = []
      for (let i = start; i <= end; i++) arr.push(i)
      return arr
    },
  },
  async mounted() {
    await this.loadFavorites()
  },
  methods: {
    async loadFavorites() {
      const authStore = useAuthStore()
      const token = authStore.token
      if (!token) return

      try {
        const res = await fetch('/api/att/my-favorite/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const favorites = await res.json()
        this.places = Array.isArray(favorites) ? favorites : []
      } catch (err) {
        console.error('즐겨찾기 목록 로딩 실패:', err)
        this.places = []
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    async toggleDetail(no) {
      const place = this.places.find((p) => p.no === no)
      if (!place) return

      if (place.latitude && place.longitude && !place.parking) {
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
          place.parking = ['오류 발생']
        }
        if (!place.overview && window.suggestPlaceToChatbot) {
          window.suggestPlaceToChatbot(place.title)
        }
      }
      this.selectedDetail = place
    },
    async onStarClick(place, event) {
      const rect = event.target.getBoundingClientRect()
      this.popupX = rect.left
      this.popupY = rect.bottom + window.scrollY

      try {
        const res = await fetch('/api/hotplace/posts')
        const posts = await res.json()
        this.relatedHotplaces = posts.filter((p) => p.attractionNo === place.no)
        this.showPopup = true
      } catch (err) {
        console.error('핫플레이스 데이터 로딩 실패', err)
      }
    },
    goDetail(id) {
      window.open(`/hotplaceDetail/${id}`, '_blank')
    },

    askLuti(title) {
      if (window.suggestPlaceToChatbot) {
        window.suggestPlaceToChatbot(title)
      }

      const toggleBtn = document.querySelector('.chatbot-container .toggle-btn')
      if (toggleBtn) toggleBtn.click()
    },
    async toggleFavorite(place) {
      const authStore = useAuthStore()
      const token = authStore.token
      if (!token) {
        alert('로그인이 필요한 기능입니다.')
        authStore.logout()
        return
      }

      try {
        await fetch('/api/att/favorite/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            attractionNo: place.no,
          }),
        })
        this.places = this.places.filter((p) => p.no !== place.no)
        alert('즐겨찾기에서 해제되었습니다.')
      } catch (err) {
        console.error('즐겨찾기 해제 실패:', err)
        alert('즐겨찾기 해제에 실패했습니다.')
      }
    },
  },
}
</script>

<style scoped>
p {
  margin: 0;
  padding: 3px;
}

.mybookmark-page {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 32px 32px;
}
.bookmark-title {
  font-size: 2rem;
  /* font-weight: 700; */
  color: #222;
  margin-bottom: 32px;
  /* text-align: center; */
}
.no-data-msg {
  text-align: center;
  color: #aaa;
  padding: 32px 0;
}
.bookmark-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px 22px;
  margin-bottom: 32px;
}
.place-card {
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(157, 187, 170, 0.06);
  cursor: pointer;
  transition:
    box-shadow 0.18s,
    border 0.18s,
    background 0.18s;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  min-height: 320px;
}
.place-card:hover {
  background: #f9fafb;
  border-color: #aaaaaa;
  box-shadow: 0 4px 18px rgba(157, 187, 170, 0.13);
}
.place-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.place-info {
  width: 100%;
  padding: 18px 18px 0 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.place-info h5 {
  font-size: 1.2rem;
  color: #222;
  font-weight: 500;
  letter-spacing: -0.5px;
  word-break: break-all;
}
.type-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
/* .star-group {
  border-bottom: 2px solid #ffc107;
} */
.gap-2 {
  gap: 8px !important;
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
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin: 32px 0 0 0;
}
.page-btn {
  background: #fff;
  border: none;
  color: #444444;
  padding: 6px 14px;
  border-radius: 50%;
  margin: 0 1px;
  cursor: pointer;
  font-size: 1rem;
}
.page-btn.active {
  background: #222;
  color: #fff;
  border-color: #222;
}
.page-btn:disabled {
  color: #aaa;
  cursor: not-allowed;
}
.page-btn-num:not(.active):hover {
  background: #f0f0f0;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  display: flex;
  flex-direction: column;
}
.btn-close-modal {
  position: absolute;
  right: 30px;
  bottom: 30px;
  padding: 10px 20px;
  background-color: #adb5bd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-close-modal:hover {
  background-color: #868e96;
}
.scroll-overview {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  background: #f9f9f9;
  font-size: 14px;
  border-radius: 6px;
}
.parking-list {
  padding-left: 0;
  margin-top: 5px;
  font-size: 16px;
  color: #444;
}
.parking-li {
  list-style: none;
  margin: 0 4px 0 19px;
  padding: 0 0 2px 0;
}
.rating-popup {
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  width: 300px;
  max-width: 90%;
}
.popup-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.popup-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.popup-list li {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.15s;
}
.popup-list li:hover {
  background: #f1f1f1;
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
</style>
