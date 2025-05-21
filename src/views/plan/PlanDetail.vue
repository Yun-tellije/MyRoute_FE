<template>
  <div class="container mt-5" v-if="plan && plan.budget != null">
    <div class="card shadow-sm p-4 mb-4">
      <h4>{{ plan.planName }}</h4>
      <div class="d-flex align-items-center">
        <p class="mb-0">작성일: {{ formatDate(plan.createdAt) }}</p>
        <small v-if="plan.updatedAt !== plan.createdAt" class="text-muted ms-2">(수정됨)</small>
      </div>
      <br />
      <p class="card-text">작성자: {{ plan.memberId }}</p>
      <p>지역: {{ plan.areaName }}</p>
      <p>예산: {{ plan.budget.toLocaleString() }}원</p>
      <p>여행일수: {{ plan.days }}일</p>
    </div>

    <div id="map" style="width: 100%; height: 400px"></div>

    <div class="mt-4">
      <h5>여행 장소 목록</h5>
      <div
        v-for="place in places"
        :key="place.placeId"
        class="card mb-3 p-3 d-flex flex-row align-items-center gap-3"
      >
        <img
          :src="place.first_image1 || '/resource/tripimage.png'"
          alt="이미지"
          style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px"
        />
        <div>
          <h6 class="mb-1">{{ place.visitOrder }}. {{ place.placeName }}</h6>
          <p class="text-muted mb-0">{{ place.addr1 || '주소 정보 없음' }}</p>
          ⭐ {{ typeof place.avgRating === 'number' ? place.avgRating.toFixed(1) : '0.0' }}
          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-sm btn-outline-secondary" @click="toggleDetail(place)">
              상세보기
            </button>
            <button class="btn btn-sm btn-outline-warning" @click="onStarClick(place, $event)">
              ⭐ 리뷰 보기
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPopup" class="rating-popup" :style="{ top: popupY + 'px', left: popupX + 'px' }">
      <div class="popup-inner">
        <h6>리뷰</h6>
        <ul class="popup-list">
          <li v-for="post in relatedHotplaces" :key="post.hotplaceId">
            <strong>{{ post.title }}</strong> ({{ post.starPoint.toFixed(1) }}점)<br />
            <small class="text-muted">{{ post.content }}</small>
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
          {{ selectedPlaceDetail.overview || '설명이 없습니다.' }}
        </div>
        <br />
        <div>
          <p>
            <strong
              ><img src="/resource/pin.svg" alt="주소" style="width: 16px; height: 16px" />
              주소</strong
            >
          </p>
          <p style="margin-left: 16px">{{ selectedPlaceDetail.addr1 }}</p>
        </div>
        <div>
          <p class="mt-3">
            <strong
              ><img src="/resource/parking.svg" alt="주차장" style="width: 16px; height: 16px" />
              주변 주차장 정보</strong
            >
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

    <div class="text-center mt-4">
      <button
        @click="toggleLike"
        class="btn"
        :class="{ 'btn-danger': likedByUser, 'btn-outline-danger': !likedByUser }"
      >
        ❤️ 추천 ({{ plan.likeCount }})
      </button>

      <button @click="$router.back()" class="btn btn-outline-secondary">돌아가기</button>
    </div>
  </div>

  <div class="text-center mt-4" v-if="myPost">
    <button @click="onEdit" class="btn btn-outline-primary">수정</button>
    <button @click="onDelete" class="btn btn-outline-danger">삭제</button>
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
        console.log('API 응답:', data)
        this.plan = data.plan
        this.places = data.places
        this.likedByUser = data.likedByUser || false
        this.myPost = data.myPost
        console.log(this.myPost)
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
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
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
          this.$router.push('/my-travel-plans')
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
  },
}
</script>

<style scoped>
.card {
  font-size: 18px;
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
</style>
