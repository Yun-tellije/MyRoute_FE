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
        </div>
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
  },
}
</script>

<style scoped>
.card {
  font-size: 18px;
}
</style>
