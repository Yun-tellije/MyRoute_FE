<template>
  <div class="plan-detail-container" v-if="plan && plan.budget != null">
    <div class="plan-buttons">
      <button @click="$router.back()" class="btn-back">
        <i class="fa-solid fa-caret-left"></i>&nbsp;목록으로 돌아가기
      </button>
      <div v-if="myPost" class="plan-owner-btns">
        <button @click="onEdit" class="btn-edit">수정</button>
        <button @click="onDelete" class="btn-delete">삭제</button>
      </div>
    </div>
    <div class="plan-header-box">
      <div class="plan-meta-row">
        <span class="plan-title">{{ plan.planName }}</span>
        <span v-if="plan.updatedAt !== plan.createdAt" class="plan-updated">(수정됨)</span>
        <span class="plan-date right-align">{{ formatDate(plan.createdAt) }}</span>
      </div>
      <div class="plan-info-row">
        <span class="plan-writer">{{ plan.memberId }}</span>
        <span class="plan-area">지역: {{ plan.areaName }}</span>
        <span class="plan-days">여행일수: {{ plan.days }}일</span>
        <span class="plan-budget">예산: {{ plan.budget.toLocaleString() }}원</span>
      </div>
    </div>
    <hr class="plan-divider" />

    <div id="map" class="plan-map"></div>
    <h5 class="plan-places-title">여행 장소 목록</h5>
    <div class="plan-places-section scrollable-places">
      <div v-for="place in places" :key="place.placeId" class="plan-place-card">
        <img
          :src="place.first_image1 || '/resource/tripimage.png'"
          alt="이미지"
          class="plan-place-img"
        />
        <div class="plan-place-info">
          <p class="plan-place-name">
            {{ place.visitOrder }}. {{ place.placeName }}
            <span class="plan-place-addr">({{ place.addr1 || '주소 정보 없음' }})</span>
          </p>

          <div class="plan-place-btns">
            <button class="btn-detail" @click="toggleDetail(place)">상세보기</button>
            <div class="plan-place-meta">
              <button class="plan-place-star" @click="onStarClick(place, $event)">
                <i class="fa-solid fa-star" style="color: #ffc107"></i>
                {{ typeof place.avgRating === 'number' ? place.avgRating.toFixed(1) : '0.0' }}
              </button>
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
            <small class="text-muted review-text">{{ post.content }}</small>
          </li>
        </ul>
        <button class="popup-close" @click="showPopup = false">닫기</button>
      </div>
    </div>

    <div v-if="selectedPlaceDetail" class="modal-backdrop" @click.self="selectedPlaceDetail = null">
      <div class="modal-content-box">
        <h5>{{ selectedPlaceDetail.title }}</h5>
        <img
          :src="selectedPlaceDetail.first_image1 || '/resource/tripimage.png'"
          class="w-100 mb-3"
        />
        <div class="overview-box">
          {{ selectedPlaceDetail.overview || '설명이 없습니다. 루티에게 물어보세요!' }}
        </div>
        <div class="modal-section">
          <p>
            <strong>
              <img src="/resource/pin.svg" alt="주소" style="width: 16px; height: 16px" />
              주소
            </strong>
          </p>
          <p style="margin-left: 16px">{{ selectedPlaceDetail.addr1 }}</p>
        </div>
        <div class="modal-section">
          <p>
            <strong>
              <img src="/resource/parking.svg" alt="주차장" style="width: 16px; height: 16px" />
              주변 주차장 정보
            </strong>
          </p>
          <ul v-if="Array.isArray(selectedPlaceDetail.parking)">
            <li
              v-for="(name, idx) in selectedPlaceDetail.parking"
              :key="idx"
              style="margin-left: 16px; margin-bottom: 2px"
            >
              {{ name }}
            </li>
          </ul>
          <p v-else>{{ selectedPlaceDetail.parking || '주차장 정보 없음' }}</p>
        </div>
        <button class="btn-close-modal" @click="selectedPlaceDetail = null">닫기</button>
      </div>
    </div>
    <div style="position: relative">
      <button @click="toggleLike" class="btn-like" :class="{ liked: likedByUser }">
        <i :class="['fa-heart', likeByUser ? 'fa-solid' : 'fa-regular']"></i> {{ plan.likeCount }}
      </button>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'PlanDetail',
  data() {
    return {
      plan: null,
      places: [],
      map: null,
      likedByUser: false,
      myPost: false,
      selectedPlaceDetail: null,
      relatedHotplaces: [],
      showPopup: false,
      popupX: 0,
      popupY: 0,
    }
  },
  mounted() {
    const authStore = useAuthStore()
    const planId = this.$route.params.planId
    const token = authStore.token

    fetch(`/api/att/plan/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('계획을 불러올 수 없습니다.')
        return res.json()
      })
      .then((data) => {
        this.plan = data.plan
        this.places = data.places
        this.likedByUser = data.likedByUser || false
        this.myPost = data.myPost
        this.$nextTick(() => this.initMap())
      })
      .catch(() => {
        alert('해당 계획을 불러오는 데 실패했습니다.')
      })

    if (!window.location.pathname.includes('/attplan')) {
      localStorage.removeItem('planItems')
      localStorage.removeItem('editPlan')
    }
  },
  methods: {
    initMap() {
      if (!window.kakao || !window.kakao.maps) {
        const script = document.createElement('script')
        script.src =
          '//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=dc1114296c501aaa901df7d025c27fba'
        script.onload = () => {
          window.kakao.maps.load(this.createMap)
        }
        document.head.appendChild(script)
      } else {
        this.createMap()
      }
    },
    createMap() {
      const container = document.getElementById('map')
      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 12,
      }
      this.map = new window.kakao.maps.Map(container, options)

      const bounds = new window.kakao.maps.LatLngBounds()
      const path = []

      this.places.forEach((place) => {
        if (!place.latitude || !place.longitude) return

        const position = new window.kakao.maps.LatLng(place.latitude, place.longitude)
        path.push(position)

        const marker = new window.kakao.maps.Marker({
          map: this.map,
          position,
          image: new window.kakao.maps.MarkerImage(
            '/resource/marker.png',
            new window.kakao.maps.Size(30, 30),
            { offset: new window.kakao.maps.Point(22, 0) },
          ),
        })

        marker.setVisible(true)

        const overlayContent = `
    <div style="padding:2px 5px; background:white; border:1px solid #888; border-radius:4px; font-size:13px;">
      ${place.visitOrder}. ${place.placeName}
    </div>
  `

        const customOverlay = new window.kakao.maps.CustomOverlay({
          content: overlayContent,
          position: position,
          yAnchor: 1.5,
        })

        customOverlay.setMap(this.map)

        const imageSrc = place.first_image1 ? place.first_image1 : '/resource/tripimage.png'

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
              <div style="font-size:14px;">
                <strong>${place.placeName}</strong><br>
                <img src="${imageSrc}" width="100" height="70"><br>
              </div>
            `,
        })

        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (this.currentInfowindow) {
            if (this.currentInfowindow.getContent() === infowindow.getContent()) {
              this.currentInfowindow.close()
              this.currentInfowindow = null
              return
            }

            this.currentInfowindow.close()
          }

          infowindow.open(this.map, marker)
          this.currentInfowindow = infowindow
        })

        bounds.extend(position)
      })

      if (path.length >= 2) {
        const polyline = new window.kakao.maps.Polyline({
          path: path,
          strokeWeight: 4,
          strokeColor: '#007bff',
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
        })
        polyline.setMap(this.map)
      }

      if (this.places.length > 0) {
        this.map.setBounds(bounds)
      }
    },
    toggleLike() {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        alert('로그인이 필요한 서비스입니다.')
        this.$router.push('/login')
        return
      }

      const url = this.likedByUser
        ? `/api/att/planlike/cancel/${this.plan.planId}`
        : `/api/att/planlike/${this.plan.planId}`

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('처리 실패')
          this.likedByUser = !this.likedByUser
          this.plan.likeCount += this.likedByUser ? 1 : -1
        })
        .catch(() => {
          alert('처리 중 오류가 발생했습니다.')
        })
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    },
    onEdit() {
      const editPlan = {
        ...this.plan,
        places: this.places.map((p) => ({
          no: p.attractionNo,
          title: p.placeName,
          latitude: p.latitude,
          longitude: p.longitude,
          first_image1: p.first_image1,
          content_type_name: p.content_type_name,
          addr1: p.addr1,
        })),
      }
      localStorage.setItem('editPlan', JSON.stringify(editPlan))
      this.$router.push({
        path: '/attplan',
        query: {
          sido: this.plan.areaName.split(' ')[0],
          gugun: this.plan.areaName.split(' ')[1] || '',
        },
      })
    },
    onDelete() {
      if (!confirm('삭제하시겠습니까?')) return
      const authStore = useAuthStore()

      fetch(`/api/att/deletePlan/${this.plan.planId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('삭제 실패')
          alert('계획이 삭제되었습니다.')
          this.$router.push('/planboard')
        })
        .catch(() => {
          alert('계획 삭제 중 오류가 발생했습니다.')
        })
    },
    async toggleDetail(place) {
      if (!place || !place.latitude || !place.longitude) {
        this.selectedPlaceDetail = place
        return
      }

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

      if (!place.overview && place.no) {
        try {
          const overviewRes = await fetch(`/api/att/overview/${place.no}`)
          if (overviewRes.ok) {
            const overviewData = await overviewRes.json()
            place.overview = overviewData.overview || '설명 없음'
          }
        } catch (err) {
          console.error('설명 정보 요청 실패:', err)
          place.overview = '설명 없음'
        }
      }

      this.selectedPlaceDetail = place
    },

    async onStarClick(place, event) {
      const rect = event.target.getBoundingClientRect()
      this.popupX = rect.left
      this.popupY = rect.bottom + window.scrollY

      try {
        const res = await fetch('/api/hotplace/posts')
        const posts = await res.json()
        this.relatedHotplaces = posts.filter((p) => p.attractionNo === place.attractionNo)
        this.showPopup = true
      } catch (err) {
        console.error('핫플레이스 리뷰 로딩 실패:', err)
      }
    },
    goDetail(id) {
      window.open(`/hotplaceDetail/${id}`, '_blank')
    },
  },
}
</script>

<style scoped>
.plan-detail-container {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 32px 32px;
}
.plan-header-box {
  border-top: 2px solid #696969;
  padding-top: 14px;
}
.plan-meta-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 8px;
  position: relative;
}
.plan-title {
  font-size: 1.6rem;
  color: #222;
  letter-spacing: -1px;
}
.plan-info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  color: #888;
  font-size: 1rem;
  margin-bottom: 2px;
}
.plan-date {
  font-size: 1rem;
  margin-left: auto;
  color: #999;
}
.right-align {
  margin-left: auto;
}
.plan-area,
.plan-days,
.plan-budget,
.plan-updated {
  font-size: 1rem;
}
.plan-updated {
  color: #999999;
  font-weight: 500;
}
.plan-divider {
  border: none;
  border-top: 1px solid #d0d0d0;
  margin: 18px 0 28px 0;
}
.plan-map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  margin-bottom: 36px;
  background: #f7f7f7;
}
.plan-places-section {
  margin-bottom: 36px;
}
.plan-places-section.scrollable-places {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
}
.plan-places-title {
  font-size: 1.08rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #333;
}
.plan-place-card {
  display: flex;
  align-items: center;
  gap: 18px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(180, 180, 180, 0.06);
}
.plan-place-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background: #e0e0e0;
}
.plan-place-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.plan-place-name {
  font-size: 1.05rem;
  font-weight: 500;
}
.plan-place-addr {
  color: #888;
  font-size: 0.98rem;
  margin: 0;
}
.plan-place-star {
  font-size: 1.01rem;
  color: #ffb300;
  border-radius: 6px;
  padding: 2px 6px;
  background-color: white;
  border: 1px solid #ffb300;
}
.plan-place-btns {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  align-items: center;
}
.btn-detail {
  background: white;
  color: #666;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-detail:hover {
  background: #bbbbbb;
  border: 1px solid #777;
  color: #fff;
}
.btn-review {
  background: white;
  color: #e9a600;
  border: 1.2px solid #ffe082;
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-review:hover {
  background: #ffe082;
  color: #fff;
}
.rating-popup {
  position: absolute;
  z-index: 3000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
}
.popup-inner {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 6px;
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content-box {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
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
.modal-section {
  margin-bottom: 12px;
}
p,
ul {
  margin: 0;
  padding: 3px;
}
li {
  list-style: none;
}
.btn-close-modal {
  margin-top: 10px;
  background: #adb5bd;
  color: white;
  border: none;
  padding: 7px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.plan-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 0;
  position: relative;
}
.btn-like {
  margin-top: 30px;
  position: absolute;
  background: #fff;
  right: 50%;
  color: #ed4856;
  border: 1.5px solid #ed4856;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-like.liked,
.btn-like:hover {
  background: #ed4856;
  color: #fff;
}
.btn-back {
  display: flex;
  align-items: center;
  background: none;
  color: #666;
  border: none;
  border-radius: 4px;
  padding: 7px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  margin-right: auto;
}
.btn-back:hover {
  color: #3576b9;
}
.plan-owner-btns {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.btn-edit,
.btn-delete {
  background: none;
  border: none;
  color: #888;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
}
.btn-edit:hover {
  color: #3576b9;
}
.btn-delete:hover {
  color: #ed4856;
}

.popup-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popup-list li {
  margin-bottom: 12px;
  font-size: 14px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}

.popup-list li:hover {
  background-color: #f1f1f1;
}

.review-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
@media (max-width: 700px) {
  .plan-detail-container {
    padding: 18px 4px;
  }
  .plan-title {
    font-size: 1.05rem;
  }
  .plan-map {
    height: 220px;
  }
  .plan-place-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 8px;
  }
  .plan-place-img {
    width: 100%;
    height: 120px;
  }
}
</style>
